// import * as express from "express"
// import * as config from "./config.json"

import * as fs from 'fs'


var city_name = "澳门"
const urlfile = "../out/" + city_name + ".json" 
if(fs.existsSync(urlfile))
{
    let userJson = JSON.parse(fs.readFileSync(urlfile,'utf-8'));
    const data = userJson[city_name];
    console.log(city_name+"今日天气： ")
    console.log(data)
}

// const app = express();

// app.listen(config.server.nodePort)


// const configJson = require('../Test/out/澳门.json')
// console.log(configJson)

// "use strict";  test

// const express = require("express");

// var city_name = "澳门"
// const urlfile = "./out/" + city_name + ".json" 
// const config = require(urlfile);

// const app = express();

// app.listen(config.city_name.nodePort, () => {
//     console.log(`在端口 ${config.city_name.nodePort} 上监听...`);
// });