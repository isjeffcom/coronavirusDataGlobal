
/** 
 * CREATE BY JEFFWU
 * COVID-19 Global API
 * Get all country/region list
*/


// Databases
const fs = require('fs')
const DbClient = require("ali-mysql-client")

// Get DB Config
const DBconf = JSON.parse(fs.readFileSync('../conf.json', 'utf8'))
DBconf['database'] = DBconf.db
const db = new DbClient(DBconf)

let cos = []

getCountryList()

async function getCountryList(){
    const d = await db
    .select("country_region")
    .from("history")
    .queryList()


    if(d){
        d.forEach((el, index) => {
            
            if(cos.indexOf(el.country_region) == -1){
                cos.push(el.country_region)
                console.log("write: " + el.country_region)
            }

            if(index == d.length - 1){
                fs.writeFile('country.txt', cos.join(), function (err) {
                    if (err) return console.log(err)
                    process.exit()
                })
            }
        })
    }

    
}



