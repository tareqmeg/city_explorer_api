`use strict`;

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

const server = express();
const PORT = process.env.PORT || 3000;
server.use(cors());
const client = new pg.Client({connectionString: process.env.DATABASE_URL});


server.get('/location', locationHandler);
function Location(cityName, locData){
  this.search_query = cityName;
  this.formatted_query = locData[0].display_name;
  this.latitude = locData[0].lat;
  this.longitude = locData[0].lon;
}

function locationHandler(req,res){
  let cityName = req.query.city;
  let KEY = process.env.GEOCODE_API_KEY;
  let locURL = `https://us1.locationiq.com/v1/search.php?key=${KEY}&q=${cityName}&format=json`;

  let SQL = `SELECT * FROM location_Data WHERE search_query=$1;`;
  client.query(SQL, [cityName]).then(data =>{
    if(data.rowCount>0){
      res.send(data.rows[0]);
    }
    else{
      superagent.get(locURL).then(getData =>{
        let gettedData = getData.body;
        let locationData = new Location(cityName, gettedData);

        let search_query = cityName;
        let formatted_query = gettedData[0].display_name;
        let latitude = gettedData[0].lat;
        let longitude = gettedData[0].lon;

        let SQL = `INSERT INTO location_Data (search_query, formatted_query, latitude, longitude) VALUES($1,$2,$3,$4);`;
        let safeValues = [search_query,formatted_query,latitude,longitude];
        client.query(SQL,safeValues);
        res.send(locationData);
      })
        .catch(error=>{
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
    let newAarr = weatherData.body.data.map((item) =>{
      let weatherObject =  new Weather(item);
      return weatherObject;
    });
    res.send(newAarr);
  });

}

server.get('/movies', moviesHandler);

server.get('/parks', parkHAndler);

function parkHAndler(req,res){
  let PARKS_API_KEY = process.env.PARKS_API_KEY;
  let cityName = req.query.search_query;
  let parkURL = `https://developer.nps.gov/api/v1/parks?q=${cityName}&limit=10&api_key=${PARKS_API_KEY}`;
  superagent.get(parkURL).then(getData =>{
    console.lon(getData);
    let gettedData = getData.body.data;
    console.lon(gettedData);
    let parkData = gettedData.map((items)=>{
      return new Park(items);
    });
    res.send(parkData);
  })
    .catch(error=>{
      res.send(error);
    });

}

function Park (cityName, parkData){
  this.cityName= cityName;
  this.name = parkData.fullName;
  this.address = `${parkData.addresses[0].line1}, ${parkData.addresses[0].city} `;
  this.fee = parkData.entranceFees[0].cost;
  this.description = parkData.description;
  this.url = parkData.url;
}

function Movies (moviesData){
  this.title =moviesData.title;
  this.overview=moviesData.overview;
  this.average_votes=moviesData.vote_average;
  this.total_votes=moviesData.total_votes;
  this.image_url=`https://image.tmdb.org/t/p/w500${moviesData.poster_path}`;
  this.popularity=moviesData.popularity;
  this.released_on=moviesData.release_date;
}
function moviesHandler(req, res) {
  let key = process.env.MOVIE_API_KEY;
  let cityName = req.query.search_query;
  let moviesURl = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${cityName}`;
  superagent.get(moviesURl).then(getData => {
    let gettedData = getData.body.results;
    let newArr = gettedData.map(element => {

      return new Movies(element);
    });
    res.send(newArr);

  })
    .catch(error=>{
      res.send(error);
    });

}

server.get('/yelp',(req,res)=>{
  let YELP_API_Key= process.env.YELP_API_KEY;
  let city_Name = req.query.search_query;
  let page = req.query.page;
  const dataPerpage =5;
  const dataAmount = ((page -1)* dataPerpage + 1);
  let yelpURL = `https://api.yelp.com/v3/businesses/search?location=${city_Name}&limit=${dataPerpage}&offset=${dataAmount}`;

  superagent.get(yelpURL).set('Authorization' ,`Bearer ${YELP_API_Key}`).then(getData => {
    let gettedData = getData.body.businesses;
    let newData = gettedData.map(items=>{
      return new Yelp (items);
    });
    res.send(newData);
  })
    .catch(error=>{
      res.send(error);
    });

});

function Yelp (yelpData){
  this.name =yelpData.name;
  this.image_url=yelpData.image_url;
  this.price=yelpData.price;
  this.rating=yelpData.rating;
  this.url = yelpData.url;
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

