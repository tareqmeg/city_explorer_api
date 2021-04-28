`use strict`;

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

const server = express();
const PORT = process.env.PORT || 3000;
server.use(cors());
const client = new pg.Client(process.env.DATABASE_URL);


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

  let SQL = `SELECT * FROM location_Data WHERE search_query=$1;`;
  let sData =[cityName];
  client.query(SQL, sData).then(Data=>{
    if(Data.rows.search_query !== cityName){

      superagent.get(locURL).then(geoData=>{
        let gData = geoData.body;
        let locationData = new Location(cityName,gData);
        let SQL = `INSERT INTO location_Data (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4) RETURNING *;`;
        let saveValues = [cityName, locationData.formatted_query, locationData.latitude, locationData.longitude];
        client.query(SQL, saveValues).then(result=>{
          res.send(result.rows);
        });
      })
        .catch(error=>{
          console.log(error);
          res.send(error);
        });
    }else{
      res.send(Data.rows).catch(error=>{
        console.log(error);
        res.send(error);
      });
    }

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
  let errObj = {
    status: 500,
    resText: 'sorry! this page not found'
  };
  res.status(404).send(errObj);
}





client.connect().then(()=>{
  server.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
  });
});

