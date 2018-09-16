// server.js
// where your node app starts
"use strict";
// init project
var express = require('express');
var app = express();
var helmet = require('helmet');
var session = require('express-session');
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(session({
  secret: '123456'
}));
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
  }
}));
app.use(helmet.xssFilter());
app.use(helmet.hidePoweredBy());
app.use(helmet.noSniff());
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
const API = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE";
const API_URL = API + "&apikey=" + "2H5BGH5TPJUQLFI6";

var request = require('request');


// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
app.get('/api/stock-prices', async (req, res) => {

  if (Array.isArray(req.query.stock))
    return handle2stocks(req, res);

  let stock = req.query.stock;
  var response = await getStockData(stock);

  handleLike(req, 1);

  let stockData = {
    stock,
    price: treat(response).price,
    likes: getLikes(req, stock)
  }

  res.json({
    stockData
  })
});

let getStockData = (stock) => {
  let url = API_URL + "&symbol=" + stock;

  return new Promise(resolve => {
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(body);
      }
    });
  });
}
let treat = (response) => {
  let re = JSON.parse(response);

  let data = re[Object.keys(re)[0]];

  let res = {};
  let dataKeys = Object.keys(data);
  res.stock = data[dataKeys[0]];
  res.price = data[dataKeys[4]];
  return res;
}
let handle2stocks = async (req, res) => {

  let stock1 = req.query.stock[0];
  let stock2 = req.query.stock[1];

  let response1 = await getStockData(stock1);
  let response2 = await getStockData(stock2);

  handleLike(req, 2);

  let stock1Likes = getLikes(req, stock1); //1
  let stock2Likes = getLikes(req, stock2); //2
  let rel_likes = stock1Likes - stock2Likes; //-1

  let stockData = [];
  stockData[0] = {
    stock: stock1,
    price: treat(response1).price,
    rel_likes
  };
  stockData[1] = {
    stock: stock2,
    price: treat(response2).price,
    rel_likes: 0 - rel_likes
  };
  return res.json({
    stockData
  });
}

let handleLike = (req, stocksNum) => {
  let like = req.query.like;
  if (!like)
    return;

  if (isLiked(req, req.query.stock))
    return;

  //todo: add like
  if (stocksNum === 1)
    return addLikeToStock(req, req.query.stock);

  addLikeToStock(req, req.query.stock[0]);
  addLikeToStock(req, req.query.stock[1]);
}
let addLikeToStock = (req, stock) => {
  if (!req.session.likes)
    req.session.likes = [];
  req.session.likes.push(stock);
}
let isLiked = (req, stock) => {
  let likes = req.session.likes;
  if (likes && Array.isArray(likes))
    return Array.prototype.includes.call(likes, stock);
  return false;
}
let getLikes = (req, stock) => {
  if (req.session.likes && isLiked(req, stock))
    return 1;
  return 0;
}
// listen for requests :)
var listener = app.listen(process.env.PORT | 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

module.exports = app;