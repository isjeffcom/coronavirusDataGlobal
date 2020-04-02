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

// Get latest
async function status(){

    let res = {
        confirmed: 0,
        death: 0,
        recovered: 0
    }

    // This part is slow
    const c = await db
    .select("last_update")
    .from("history")
    .orderby("last_update desc")
    .queryRow()

    let d = await byDate(c.last_update)
    d = d.data

    for(let i=0;i<d.length;i++){
        
        res.confirmed = res.confirmed + d[i].confirmed
        res.death = res.death + d[i].death
        res.recovered = res.recovered + d[i].recovered
    }

    if(res){
        return { status: true, data: res}
    } else {
        return { status: false, data: null, err: res }
    }
}


async function byDate(date){

    const result = await db
    .select("*")
    .from("history")
    .where("last_update", date)
    .orderby("last_update desc")
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
    .orderby("last_update desc")
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
    .orderby("last_update desc")
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
    .orderby("last_update desc")
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
    .orderby("last_update desc")
    .queryList()

    if(result){
        return { status: true, data: result}
    } else {
        return { status: false, data: null, err: result }
    }

}

async function majorEU(){

    const italy = await db
    .select("*")
    .from("history")
    .where("country_region", "Italy")
    .orderby("last_update asc")
    .queryList()

    const germany = await db
    .select("*")
    .from("history")
    .where("country_region", "Germany")
    .orderby("last_update asc")
    .queryList()

    const france = await db
    .select("*")
    .from("history")
    .where("country_region", "France")
    .orderby("last_update asc")
    .queryList()

    const spain = await db
    .select("*")
    .from("history")
    .where("country_region", "Spain")
    .orderby("last_update asc")
    .queryList()

    if(italy && germany && france && spain){
        return { status: true, data: { Italy: italy, Germany: germany, France: france, Spain: spain }}
    } else {
        return { status: false, data: null, err: "err" }
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
    status: status,
    byDate: byDate,
    byCountry: byCountry,
    byPlace: byPlace,
    byDateCountry: byDateCountry,
    byDatePlace: byDatePlace,
    majorEU: majorEU
}
