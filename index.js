/** 
 * CREATE BY JEFFWU
 * COVID-19 Global API
 * Use JavaScript for IO performance
*/

const { exec } = require("child_process")
const util = require('./util')

// Express JS
const express = require('express')
const app = express()


// DB
const database = require('./database')


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
    let host = server.address().address;
    let port = server.address().port;
    console.log('Your App is running at http://%s:%s', host, port)

    // Start function
    onCreate()

})

// Current
app.get('/current', async (req, res) => {
    res.send(await database.latest())
})

// Sort
app.get('/data', async (req, res) => {

    let queryDate
    if(req.query.date){
        queryDate = util.dcUS2Globe(req.query.date)
    }

    if(req.query.date && req.query.country){
        res.send(await database.byDateCountry(queryDate, req.query.country))
    }

    else if(req.query.date){
        res.send(await database.byDate(queryDate))
    }

    else if(req.query.country){
        res.send(await database.byCountry(req.query.country))
    }
    
})

function onCreate(){
   // Do nothing...
}


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

