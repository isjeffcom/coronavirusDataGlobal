
/** 
 * CREATE BY JEFFWU
 * COVID-19 Global API
 * Get all province list
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
    .select("province_state")
    .from("history")
    .queryList()


    if(d){
        d.forEach((el, index) => {
            
            if(cos.indexOf(el.province_state) == -1){
                cos.push(el.province_state)
                console.log("write: " + el.province_state)
            }

            if(index == d.length - 1){
                fs.writeFile('province.txt', cos.join(), function (err) {
                    if (err) return console.log(err);
                    process.exit()
                })
            }
        })
    }

    
}



