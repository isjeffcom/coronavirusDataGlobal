'''
    Create By JeffWu
    https://isjeff.com

    PULL FROM GSSE AND UPDATE
    UPDATE BY UPDATE()

'''

import os
import pymysql.cursors
import csv
import json


# update github
os.system('cd COVID-19 && git pull origin')

# load database config
with open('./conf.json') as f:
    db_conf = json.load(f)


# connect to database
connection = pymysql.connect(host=db_conf['host'],
                             user=db_conf['user'],
                             password=db_conf['password'],
                             db=db_conf['db'],
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)

# data file path
path = "./COVID-19/csse_covid_19_data/csse_covid_19_daily_reports"
files = os.listdir(path)

# all file saver
allFiles = []



# get who is the latest in file
def getLatestInFiles():
    
    for file in files: 
        if not os.path.isdir(file): 
            if file.find("csv") != -1:
                fnIdx = file.find(".")
                fn = file[0:fnIdx]
                allFiles.append(fn)

    return allFiles[len(allFiles) - 1]

# get who is the latest in Database
def getLatestInDB():
    try:
        with connection.cursor() as cursor:
            # Create a new record
            sql = "SELECT `last_update` FROM `history` ORDER BY `last_update` DESC"
            cursor.execute(sql)
            result = cursor.fetchone()
            return result['last_update']

            

        # connection is not autocommit by default. So you must commit to save
        # your changes.
        connection.commit()

    finally:
        print('done')
        #connection.close()

def createCache(data, update):

    # File name
    n = update

    with open('./data/'+n+'.json', 'w') as outfile:
        json.dump(data, outfile)
        print(n+" - done")


def updateDB(code, admin, province, country, update, la, lo, confirmed, death, recovered, active, key):

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
            
            # insert
            sql = "INSERT INTO `history` (`area_code`, `admin_area`, `province_state`, `country_region`, `last_update`, `la`, `lo`, `confirmed`, `death`, `recovered`, `active`, `combined_key`) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
            cursor.execute(sql, (code, admin, province, country, update, la, lo, confirmed, death, recovered, active, key))

        connection.commit()

    finally:
        print(update+" - done")
        #connection.close()

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

last = getLatestInDB()
current = getLatestInFiles()

if last == current:
    print("no need for update")
else:
    print("update needed")
    with open(path+"/"+current+'.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')

        line_count = 0

        thisUpdate = current

        output = []

        for row in csv_reader:

            line_count = line_count + 1

            if line_count != 1:
                updateDB(row[0], row[1], row[2], row[3], thisUpdate, row[5], row[6], row[7], row[8], row[9], row[10], row[11])
                output.append(constData(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11]))
            
        
        createCache(output, thisUpdate)
