`use strict`;

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const server = express();

const PORT = process.env.PORT || 3000;
server.use(cors());



server.get('/location',(req,res) =>{
  let locationData = require('./data/location.json');
  let locationRes = new Location(locationData);

  res.send(locationRes);

});

server.get('/weather',(req,res) =>{
  let weathData = require('./data/weather.json');
  let newAarr =[];
  weathData.data.forEach(item =>{
    let wearherData = new Weather(item);
    newAarr.push(wearherData);
  });

  server.get('*',(req,res)=>{
    let errObj = {
      status: 404,
      resText: 'sorry! this page not found'
    };
    res.status(404).send(errObj);
  });
  res.send(newAarr);
});

function Location(locData){
  this.search_query = 'Lynnwood';
  this.formatted_query = locData[0].display_name;
  this.latitude = locData[0].lat;
  this.longitude = locData[0].lon;
}
function Weather(weatherData){
  this.forecast = weatherData.weather.description;
  this.time = weatherData.valid_date;
}


server.listen(PORT,()=>{
  console.log(`listening on port ${PORT}`);
});
