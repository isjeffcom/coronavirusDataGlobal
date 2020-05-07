/** 
 * CREATE BY JEFFWU
 * COVID-19 Global API
 * Use JavaScript for IO performance
*/

const { exec } = require("child_process")
const fs = require('fs')
const path = require('path')
const util = require('./util')

// Express JS
const express = require('express')
const app = express()

// DB
const database = require('./database')

// Node Schedule
const schedule = require('node-schedule-tz')

// Axios Request
const request = require('./request')

// Mapbox API and token
const DBconf = JSON.parse(fs.readFileSync('./conf.json', 'utf8'))
const mapboxAPI = DBconf.mapbox_api
const mapboxToken = DBconf.mapbox_token


// Redis Fast Cache
//const redis = require("redis")
//const redisClient = redis.createClient()

/*redisClient.on("error", function(error) {
    console.error(error);
});*/

/**
 * ROUTER
 * 
 * /current: Get Latest Global Data
 * /data?date=<YYYY-MM-DD>: Search data by date
 * /data?country=<country name>: Search data in country level
 * /data?date=<YYYY-MM-DD>&&country=<country name>: Search data by date and country
 * /data?place=<province or state>: Search data in province level
 * 
 * Be aware:
 * 
 * China Mainland == Mainland China
 * PRC Hong Kong == Hong Kong
 * PRC Macau == Macau
 * ROC Taiwan == Taiwan
 * 
**/

var currentCacheTime = 0
var statusCacheTime = 0
var placeCacheTime = 0
var countryCacheTime = 0
var euCacheTime = 0
var realtimeCache = 0

let cachePath = './data/cache/'

if(!fs.existsSync(path.join(__dirname, cachePath))){
    fs.mkdirSync(cachePath)
}

// Set CROS
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS")
    res.header("X-Powered-By",' 3.2.1')
    next()
})


// Start HTTP server
let server = app.listen(8003, function () {
    let host = server.address().address
    let port = server.address().port
    console.log('Your App is running at http://%s:%s', host, port)

    // Start function
    onCreate()

})

// Current
app.get('/current', async (req, res) => {
    fn = "current"
    // Get file cache if exists
    if(checkFileCache(fn) && checkCacheTime(currentCacheTime)){
        const stream = fs.createReadStream(path.join(__dirname, cachePath + fn + '.json'))
        stream.pipe(res)
    } else {
        const data = await database.latest()
        res.send(data)
        if(data.data.length > 0){
            writeFileCache(fn, data)
        }
    }
    
})

// Current
app.get('/status', async (req, res) => {

    fn = "status"
    
    // Get file cache if exists
    if(checkFileCache(fn) && checkCacheTime(statusCacheTime)){
        const stream = fs.createReadStream(path.join(__dirname, cachePath + fn + '.json'))
        stream.pipe(res)
    } else {
        const data = await database.status()
        res.send(data)
        writeFileCache(fn, data)
    }
    
})



// Sort
app.get('/data', async (req, res) => {

    let queryDate

    // Convert US data format to global format
    if(req.query.date){
        queryDate = util.dcUS2Globe(req.query.date)
    }

    if(req.query.date && req.query.country){

        let fn = req.query.country + "-" + req.query.date

        if(checkFileCache(fn)){
            const stream = fs.createReadStream(path.join(__dirname, cachePath + fn + '.json'))
            stream.pipe(res)
        } else {
            const data = await database.byDateCountry(queryDate, req.query.country)
            res.send(data)
            if(data.data.length > 0){
                writeFileCache(fn, data)
            }
            
        }
    }

    if(req.query.date && req.query.place){
        let fn = req.query.place + "-" + req.query.date

        if(checkFileCache(fn)){
            const stream = fs.createReadStream(path.join(__dirname, cachePath + fn + '.json'))
            stream.pipe(res)
        } else {
            const data = await database.byDatePlace(queryDate, req.query.place)
            res.send(data)
            if(data.data.length > 0){
                writeFileCache(fn, data)
            }
        }
    }

    else if(req.query.date){

        // Get file cache if exists
        if(fs.existsSync(path.join(__dirname, './data/' + req.query.date + '.json'))){
            const stream = fs.createReadStream(path.join(__dirname, './data/' + req.query.date + '.json'))
            stream.pipe(res)
        } else {
            res.send(await database.byDate(queryDate))
        }
    }

    else if(req.query.place){

        let fn = req.query.place

        console.log(checkCacheTime(placeCacheTime))

        if(checkFileCache(fn) && checkCacheTime(placeCacheTime)){

            const stream = fs.createReadStream(path.join(__dirname, cachePath + fn + '.json'))
            stream.pipe(res)

        } else {
            const data = await database.byPlace(req.query.place)
            res.send(data)
            if(data.data.length > 0){
                writeFileCache(fn, data)
            }

            // Save Cache Time
            placeCacheTime = Date.parse( new Date())
        }

    }

    else if(req.query.country){

        let fn = req.query.country

        if(checkFileCache(fn) && checkCacheTime(countryCacheTime)){
            const stream = fs.createReadStream(path.join(__dirname, cachePath + fn + '.json'))
            stream.pipe(res)
        } else {
            const data = await database.byCountry(req.query.country)
            res.send(data)
            if(data.data.length > 0){
                writeFileCache(fn, data)
            }

            // Save Cache Time
            countryCacheTime = Date.parse( new Date())
        }

    }

    else {
        res.send("No Query Parameters")
    }
    
})


// Private (no access-control) for COVID19UK.LIVE
app.get('/majoreu', async (req, res) => {
    let fn = 'marjoyeu'

    if(checkFileCache(fn) && checkCacheTime(euCacheTime)){
        const stream = fs.createReadStream(path.join(__dirname, cachePath + fn + '.json'))
        stream.pipe(res)
    } else {
        const data = await database.majorEU()
        res.send(data)
        writeFileCache(fn, data)

        // Save Cache Time
        euCacheTime = Date.parse( new Date())
    }
})

// Private (no access-control) for COVID19UK.LIVE
app.get('/realtime', async (req, res) => {
    let fn = 'realtime'

    if(checkFileCache(fn) && checkCacheTime(realtimeCache, 10*60*1000)){

        const stream = fs.createReadStream(path.join(__dirname, cachePath + fn + '.json'))
        stream.pipe(res)

    } else {
        request.genGet("https://api.covid19api.com/summary", [], async (response)=>{
            let result = response.data

            // Add Geo Location
            let pRes = await kGeo(result)
            res.send(pRes)
            writeFileCache(fn, pRes)

            // Cache new geo location to DB
            saveGeo(result.Countries)
        })

        // Save Cache Time
        realtimeCache = Date.parse( new Date())
    }
})

function onCreate(){
   // Do nothing...
}

async function saveGeo(data){
    
    let geo = await database.geo()
    if(geo){

        data.forEach(async el => {
          // If doesnt exist
          if(util.idIdxsInArrWithId(el.Country, geo.data, 'name') == -1){
    
            let loca = encodeURI(el.Country)
            
            await request.genGet(mapboxAPI+ loca +".json", [{name: "access_token", val: mapboxToken}], (res)=>{
              
              if(res.status){
                let center = res.data.features[0].center
                
                let ready = {
                  name: el.Country,
                  lo: center[0],
                  la: center[1]
                }
      
                database.addGeo(ready)
    
              }
            })
          }
        })
      }
}

async function kGeo(data){

    let all = await database.geo()
    let res = data

    for(let i=0;i<res.Countries.length;i++){
        
        let geo = await matchGeo(res.Countries[i].Country, all.data)
        //console.log(geo)
        if(geo){
            res.Countries[i].la = geo.la
            res.Countries[i].lo = geo.lo
        } else {
            res.Countries[i].la = null
            res.Countries[i].lo = null
        }
    }

    return res
}

async function matchGeo(name, geo){

    for(let i=0;i<geo.length;i++){
        if(name == geo[i].name){
            return {lo: geo[i].lo, la: geo[i].la}
        }
    }

    return false
}

// Call for update from nodejs
function forceUpdate(){
    exec("python update.py", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    })
}

function checkFileCache(name){
    
    if(fs.existsSync(cachePath + name + '.json')){
        return true
    } else {
        return false
    }
}

function writeFileCache(name, data){
    fs.writeFileSync(path.join(__dirname, cachePath + name + '.json'), JSON.stringify(data), ()=>{
        // Do nothing
      })
}

function checkCacheTime(ts, limit){

    if(ts == 0){
        return false
    }

    if(!limit){
        limit = 3 * 60 * 60 * 1000
    }

    const current = Date.parse( new Date())
    if(current > (ts + limit)){
        return false
    } else {
        return true
    }
}


// Save current cache
async function putCurrent(){
    const data = await database.latest()
    writeFileCache('current', data)
}

// Schedule Tasks
var updateAll = schedule.scheduleJob('updateall', '01 * * * *', 'Europe/London', function(){
    putCurrent()
})

/*function setRedisData(key ,val){
    return new Promise(resolve => {
        redisClient.set(key, val, (res)=>{
            resolve(res)
        })
    })
}

function getRedisData(){
    return new Promise(resolve => {
        redisClient.get(key, (res)=>{
            resolve(res)
        })
    })
}*/

