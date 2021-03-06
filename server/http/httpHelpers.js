var request = require('request');
var pokemonHelper = require('./pokeHelpers.js');

/*
Ride Request

POST PARAMETERS

Name                  Type     Description
product_id            string  The unique ID of the product being requested.
start_latitude        float   The beginning or "pickup" latitude.
start_longitude       float   The beginning or "pickup" longitude.
end_latitude          float   The final or destination latitude.
end_longitude         float   The final or destination longitude.
surge_confirmation_id (optional)  string  The unique identifier of the surge session for a user. Required when returned from a 409 Conflict response on previous POST attempt.
*/

module.exports.requestRide = function(req, res) {
  var token = req.session.access_token;

  // First get uber products for the area of request
  var startLat = req.body.data.start_latitude,
      startLong = req.body.data.start_longitude;

  var endLat = req.body.data.end_latitude,
      endLong = req.body.data.end_longitude;

  var legendary = req.body.data.legendary;

  if(token === undefined) {
    console.log('Error: user not authenticated');
    res.status(401).end();
  } else {
    getProducts(startLat, startLong, token, function(data) {
      if (data.products.length > 0) {
        var product_id = data.products[0].product_id;
        request({
          url: 'https://sandbox-api.uber.com/v1/requests',
          method: 'POST',
          json: {
            'product_id': product_id,
            'start_latitude': startLat,
            'start_longitude': startLong,
            'end_latitude': endLat,
            'end_longitude': endLong
          },
          headers: {
            'Content-Type': 'application/JSON',
            'Authorization': 'Bearer ' + token
          }

        }, function(error, response, body) {
          if(error) {
            console.log('error:', error);
          }
          if(legendary === false) {
            pokemonHelper.addPokemon(req, res);
          } else {
            pokemonHelper.addLegendary(req, res, legendary);
          }

          res.end();
        });
      } else {
        res.status(400).send();
      }
  });
  }
};

var getProducts = function(lat, long, token, callback) {
  request({
    url: 'https://api.uber.com/v1/products',
    method: 'GET',
    qs: {
      latitude: lat,
      longitude: long
    },
    headers: {
      'Content-Type': 'application/JSON',
      'Authorization': 'Bearer ' + token
    }
  }, function(error, res, body) {
    callback(JSON.parse(body));
  });
};


