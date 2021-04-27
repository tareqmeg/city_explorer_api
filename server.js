`use strict`;

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');

const server = express();
const PORT = process.env.PORT || 3000;
server.use(cors());


server.get('/location', locationHandler);
function Location(cityName, locData){
  this.search_query = cityName;
  this.formatted_query = locData[0].display_name;
  this.latitude = locData[0].lat;
  this.longitude = locData[0].lon;
}

function locationHandler(req,res){
  let cityName = req.query.city;
  let LOCATION_KEY = process.env.GEOCODE_API_KEY;
  let locURL = `https://us1.locationiq.com/v1/search.php?key=${LOCATION_KEY}&q=${cityName}&format=json`;

  superagent.get(locURL).then(geoData=>{

    let gData = geoData.body;
    let locationData = new Location(cityName,gData);
    res.send(locationData);
  })
    .catch(error=>{
      console.log(error);
      res.send(error);
    });
}
server.get('/weather', weathersHandler);
function Weather(weatherData){
  this.forecast = weatherData.weather.description;
  this.time = weatherData.datetime;
}
function weathersHandler (req,res){
  let cityName = req.query.search_query;
  let WEATHER_KEY = process.env.WEATHER_KEY;
  let weatherURL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${WEATHER_KEY}&days=8`;
  superagent.get(weatherURL).then(weatherData=>{
    console.log(weatherData);
    let newAarr = weatherData.body.data.map((item) =>{
      let weatherObject =  new Weather(item);
      return weatherObject;
    });
    res.send(newAarr);
  });

}


server.get('/*', generalHandler);
function generalHandler(req,res){
  res.send(newAarr);
});
server.get('*',(req,res)=>{

  let errObj = {
    status: 500,
    resText: 'sorry! this page not found'
  };
  res.status(404).send(errObj);
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