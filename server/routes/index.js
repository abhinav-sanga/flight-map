var express = require('express');
var router = express.Router();

const axios = require('axios');
const params = {
  access_key: 'd241d8779a9355b537dab78bd6557bd0'
}

/* GET home page. */
router.get('/', function (req, res, next) {
  // axios.get('http://api.aviationstack.com/v1/flights', {params})
  let currDdate = Math.floor(new Date().getTime() / 1000);
  let yesDate = Math.floor(new Date('2023.01.09').getTime() / 1000);
  axios.get(`https://opensky-network.org/api/flights/departure?airport=VIDP&begin=${yesDate}&end=${currDdate}`)
    .then(response => {
      const apiResponse = response.data;
      res.json(apiResponse);
    }).catch(error => {
      console.log(error);
    });
});

module.exports = router;
