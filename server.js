`use strict`;

const express = require('express');
require('dotenv').config();
const server = express();


const PORT = process.env.PORT || 3000;

server.get('/',(req,res)=>{
  res.status(200).send('Hi from the data page, I am the server !!!');
});

server.get('/location',(req,res) =>{
  let locationData = require('./data/location.json');
  let locationRes = new Location(locationData);

  res.send(locationRes);
});

function Location(locData){
  this.search_query = 'Lynnwood';
  this.formatted_query = locData[0].display_name;
  this.latitude = locData[0].lat;
  this.longitude = locData[0].lon;
}


server.listen(PORT,()=>{
  console.log(`listening on port ${PORT}`);
});
