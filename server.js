`use strict`;

const express = require('express');
const server = express();


const PORT = process.env.PORT || 3000;

server.get('/data',(req,res)=>{
  res.status(200).send('Hi from the data page, I am the server !!!');
});


server.listen(PORT,()=>{
  console.log(`listening on port ${PORT}`);
});
