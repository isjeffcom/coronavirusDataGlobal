// Databases
var fs = require('fs')
const DbClient = require("ali-mysql-client")

// Get DB Config
const DBconf = JSON.parse(fs.readFileSync('./conf.json', 'utf8'))
DBconf['database'] = DBconf.db
const db = new DbClient(DBconf)

// Get latest
async function latest(){

    // This part is slow
    const d = await db
    .select("last_update")
    .from("history")
    .orderby("last_update desc")
    .queryRow()

    const result = await byDate(d.last_update)

    if(result){
        return { status: true, data: result.data}
    } else {
        return { status: false, data: null, err: result }
    }
}

async function byDate(date){

    const result = await db
    .select("*")
    .from("history")
    .where("last_update", date)
    .queryList()

    if(result){
        return { status: true, data: result}
    } else {
        return { status: false, data: null, err: result }
    }
}


async function byCountry(country){

    const result = await db
    .select("*")
    .from("history")
    .where("country_region", country)
    .queryList()

    if(result){
        return { status: true, data: result}
    } else {
        return { status: false, data: null, err: result }
    }

}

async function byPlace(place){

    const result = await db
    .select("*")
    .from("history")
    .where("province_state", place)
    .queryList()

    if(result){
        return { status: true, data: result}
    } else {
        return { status: false, data: null, err: result }
    }

}

async function byDateCountry(date, country){

    const result = await db
    .select("*")
    .from("history")
    .where("last_update", date)
    .where("country_region", country)
    .queryList()

    if(result){
        return { status: true, data: result}
    } else {
        return { status: false, data: null, err: result }
    }

}

async function byDatePlace(date, place){

    const result = await db
    .select("*")
    .from("history")
    .where("last_update", date)
    .where("province_state", place)
    .queryList()

    if(result){
        return { status: true, data: result}
    } else {
        return { status: false, data: null, err: result }
    }

}


function addZero(str){
    str = str.toString()
    if(str < 10){
        return str = "0" + str
    } else {
        return str
    }
}

module.exports = {
    latest: latest,
    byDate: byDate,
    byCountry: byCountry,
    byPlace: byPlace,
    byDateCountry: byDateCountry,
    byDatePlace: byDatePlace
}
