'''

    Create By JeffWu
    https://isjeff.com

    
    IMPORT ALL DATA INTO DATABASE BY MAIN()
    CACHE ALL DATA TO JSON BY CACHE()
    PLEASE CLEAN DATA FOLDER AND CLEAN DATABASE BEFORE RUN THIS SCRIPT
    FOR INIT ONLY
    MAKE SURE YOU HAVE GIT CLONED AT ROOT https://github.com/CSSEGISandData/COVID-19

'''

import json
import pymysql.cursors
import csv
import os
import os.path
from os import path

#declear path
dataPath = "./COVID-19/csse_covid_19_data/csse_covid_19_daily_reports"

# create git clond if data not exists
if not path.exists(dataPath):
    print("Get dataset from JHU CSSE: https://github.com/CSSEGISandData/COVID-19")
    os.system("git clone https://github.com/CSSEGISandData/COVID-19")
else:
    print("Update Dataset from JHU CSSE: https://github.com/CSSEGISandData/COVID-19")
    os.system('cd COVID-19 && git pull origin')

print("Dataset Updated")

# create folder if not exist
if not os.path.exists('./data'):
    os.makedirs('./data')

# file path
files = os.listdir(dataPath)

# get database config
with open('./conf.json') as f:
    db_conf = json.load(f)

# connect to database
connection = pymysql.connect(host=db_conf['host'],
                             user=db_conf['user'],
                             password=db_conf['password'],
                             db=db_conf['db'],
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)

# clear and create db table
def createTable():
    print("Clean and create history table")
    with connection.cursor() as cursor:
        drop = "DROP TABLE IF EXISTS `history`"
        cursor.execute(drop)
        create = "CREATE TABLE IF NOT EXISTS `history` (`id` int(32) NOT NULL AUTO_INCREMENT,`area_code` varchar(64) DEFAULT NULL,`admin_area` varchar(300) DEFAULT NULL,`province_state` varchar(300) DEFAULT NULL,`country_region` varchar(300) DEFAULT NULL,`last_update` varchar(300) DEFAULT NULL,`la` varchar(300) DEFAULT NULL,`lo` varchar(300) DEFAULT NULL,`confirmed` int(11) DEFAULT NULL,`death` int(11) DEFAULT NULL,`recovered` int(11) DEFAULT NULL,`active` int(11) DEFAULT NULL,`combined_key` text DEFAULT NULL,PRIMARY KEY (`id`))"
        cursor.execute(create)



# insert 1 row to database
def write(code, admin, province, country, update, la, lo, confirmed, death, recovered, active, key):

    if confirmed == '':
        confirmed = 0

    if death == "":
        death = 0

    if recovered == "":
        recovered = 0

    if active == "":
        active = 0
    
    try:
        with connection.cursor() as cursor:
            # INSERT
            sql = "INSERT INTO `history` (`area_code`, `admin_area`, `province_state`, `country_region`, `last_update`, `la`, `lo`, `confirmed`, `death`, `recovered`, `active`, `combined_key`) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
            cursor.execute(sql, (code, admin, province, country, update, la, lo, confirmed, death, recovered, active, key))

        connection.commit()

    finally:
        print(update+" - insert done")
        #connection.close()


# construct a data object for write json
def constData(code, admin, province, country, update, la, lo, confirmed, death, recovered, active, key):
    data = {}
    data["area_code"] = code
    data["admin_area"] = admin
    data["province_state"] = province
    data["country_region"] = country
    data["last_update"] = update
    data["la"] = la
    data["lo"] = lo
    data["confirmed"] = confirmed
    data["death"] = death
    data["recovered"] = recovered
    data["active"] = active
    data["combined_key"] = key

    return data

# create cache json file
def createCache(data, update):

    # File name
    n = update

    with open('./data/' + n + '.json', 'w') as outfile:
        json.dump(data, outfile)
        print( n + " - json cached" )

# main loop
def main():
    print("Main Process Started")
    for file in files: 
        if not os.path.isdir(file): 
            if file.find("csv") != -1:

                with open(dataPath+"/"+file) as csv_file:

                    csv_reader = csv.reader(csv_file, delimiter=',')
                    line_count = 0
                    fnIdx = file.find(".")
                    thisUpdate = file[0:fnIdx]

                    output = []

                    for row in csv_reader:

                        line_count = line_count + 1

                        d = {}

                        if line_count != 1:

                            if len(row) == 6:
                                write('', '', row[0], row[1], thisUpdate, '', '', row[3], row[4], row[5], 0, '')
                                d = constData('', '', row[0], row[1], row[2], '', '', row[3], row[4], row[5], 0, '')

                            if len(row) == 8:
                                write('', '', row[0], row[1], thisUpdate, row[6], row[7], row[3], row[4], row[5], 0, '')
                                d = constData('', '', row[0], row[1], row[2], row[6], row[7], row[3], row[4], row[5], 0, '')

                            if len(row) == 12:
                                write(row[0], row[1], row[2], row[3], thisUpdate, row[5], row[6], row[7], row[8], row[9], row[10], row[11])
                                d = constData(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11])
                                
                            output.append(d)

                    createCache(output, thisUpdate)


# on create
createTable()
#main()
main()

# close database
connection.close()

print("SUCCESS: Init Completed")
print("Notice: You can set up timer for regularly update by excute update.py")
print("Run APIs: Start restful APIs by: `npm i && npm run dev` (NodeJS Required)")
print("Twin Project: https://github.com/isjeffcom/coronvirusFigureUK")
print("Jeff Wu: https://isjeff.com")