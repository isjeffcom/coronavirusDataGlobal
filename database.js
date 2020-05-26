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

async function geo(){

    const result = await db
    .select("*")
    .from("geo")
    .queryList()

    if(result){
        return { status: true, data: result}
    } else {
        return { status: false, data: null, err: result }
    }
}

async function addGeo(ready){
    const save = await db
        .insert("geo", ready)
        .execute()

    return save ? { status: true, data: null} : { status: false, data: null, err: save }
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

    let resItaly = await processSameCountry(italy)
    let resGermany = await processSameCountry(germany)
    //let resFrance = await processSameCountry(france)
    let resSpain = await processSameCountry(spain)

    if(italy && germany && france && spain){
        return { status: true, data: { Italy: resItaly, Germany: resGermany, France: france, Spain: resSpain }}
    } else {
        return { status: false, data: null, err: "err" }
    }

}

async function processSameCountry(obj){
    return new Promise(async resolve=>{
        let res = []

        // Save country has been processed
        let done =[]

        for(let i=0;i<obj.length;i++){
            let el = obj[i]
            if(el.country_region == el.province_state || el.province_state == ""){
                res.push(el)
                done.push(el.country_region+el.last_update)
            } else {
                if(done.indexOf(el.country_region+el.last_update) == -1){
                    let n = await sameCountryDate(obj, el.country_region, el.last_update, el)
                    res.push(n)
                    //console.log(n)
                    done.push(el.country_region+el.last_update)
                }
                
            }
        }

        resolve(res)
    })
    
}

async function sameCountryDate(obj, country, date, ref){
    return new Promise(resolve=>{
        let res = Object.assign(ref)

        confirmed = 0
        death = 0
        recovered = 0
        active = 0

        for(let c=0;c<obj.length;c++){
            let ele = obj[c]
            if(ele.last_update == date && ele.country_region == country){
                confirmed += ele.confirmed
                death += ele.death
                recovered += ele.recovered
                active += ele.active
            }
        }

        res.confirmed = confirmed
        res.death = death
        res.recovered = recovered
        res.active = active

        res.province_state = country
        res.combined_key = country

        resolve(res)
    })
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
    majorEU: majorEU,
    geo: geo,
    addGeo: addGeo
}
