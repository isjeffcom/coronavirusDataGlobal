# COVID-19 Global Data API

<img src="https://i.ibb.co/1Mb9Df8/covid19global.png" alt="covid-19 global update" width="40%">

Coronavirus Global Data Collector and API

This is sub-project for better understanding, analysis and visualize COVID-19 data in the UK.
Main Project: https://github.com/isjeffcom/coronvirusFigureUK

# Important
The data collection code in init.py -> main() needs to fit the CSV data format published by JH CSSE. As they have changed data format for 3 times, and maybe more for the future. The script needs to constantly monitor and change if any changed. 

# Getting Started

### Data
1. Install Python(2 or 3), git and MySQL to your environment
2. Install PyMySQL by `pip install PyMySQL`
3. Rename `conf_tmp.json` to `conf.json` and config your database
4. Excute `python init.py`

That's it, you have global covid-19 data in your database `history` table and cached in `/data` folder as JSON format

### API
5. Install NodeJs
6. Excute `npm i && npm run dev` to start up API server

The server will running at: `http://localhost:8003`


### Update
<b>excute `python update.py`</b><br><br>
You can set up a timer for this by `corn` or `node-schedule`, maybe any, once a day

# API Query List

`/`: Default api, output cached data from data/data.json
`/current`: Get Latest Global Data
`/data?date=<YYYY-MM-DD>`: Search data by date
`/data?country=<country name>`: Search data in country level
`/data?date=<YYYY-MM-DD>&country=<country name>`: Search data by date and country
`/data?place=<province or state>`: Search data in province level
`/data?date=<YYYY-MM-DD>&place=<province or state>`: Search data in province level

### All countries and provinces list
The full countries and provinces list in in `/list`, however, as the data is keep updating, run those 2 js script eg. `node country.js` can generate a new list. 

<b>Be aware</b>
China Mainland == Mainland China
PRC Hong Kong == Hong Kong
PRC Macau == Macau
ROC Taiwan (China) == Taiwan



Standard date format: YYYY-MM-DD

# Dataset
Thanks for Johns Hopkins CSSE provide this dataset. They are doing a great job.
https://github.com/CSSEGISandData/COVID-19

# Public API
[WORKING ON IT]

# Notice
1. The reason to use NodeJs is for better server performance, and the reason why I use python is just because I want to learn it. Whether data collection or api server, both parts can use either Python or NodeJs. As I am a UX designer, it's just for fun.
2. You can use NodeJs to excute python update by a function I placed in index.js call forceUpdate(). 
3. If you don't want to install NodeJs, use python to start a server is not a hard thing to do.
4. My Sql is not really needed, you can use any technology to storage data
