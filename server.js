`use strict`;

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const server = express();

const PORT = process.env.PORT || 3000;
server.use(cors());

server.get('/',(req,res)=>{
  res.status(200).send('Hi from the data page, I am the server !!!');
});

server.get('/location',(req,res) =>{
  let locationData = require('./data/location.json');
  let locationRes = new Location(locationData);

  res.send(locationRes);

});

server.get('/weather',(req,res) =>{
  let weathData = require('./data/weather.json');
  let newWarr =[];
  weathData.data.forEach((item)=>{
    let wearherData = new Weather(item);
    newWarr.push(wearherData);
  });


  res.send(newWarr);
});

function Location(locData){
  this.search_query = 'Lynnwood';
  this.formatted_query = locData[0].display_name;
  this.latitude = locData[0].lat;
  this.longitude = locData[0].lon;
}
function Weather(weathData){
  this.forcast = weathData.weather.description;
  this.time = weathData.valid_data;



}


server.listen(PORT,()=>{
  console.log(`listening on port ${PORT}`);
});