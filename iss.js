/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */

const request = require('request');

// implemented function to fetch latitude and longitude

const fetchCoordsByIP = function(ip, callback) {
  request(`http://ipwho.is/${ip}`, (error, response, body) => {
    //return an error if there is one
    if (error) {
      callback(error, null);
      return;
    }

    const bodyParsed = JSON.parse(body);

    if (!bodyParsed.success) {
      const message = `Status is ${bodyParsed.success} when getting latitude and longitude. Server message: ${bodyParsed.message} while getting IP ${bodyParsed.ip}`;
      callback(Error(message), null);
      return;
    }

    const { latitude, longitude } = bodyParsed;

    callback(null, { latitude, longitude });
  });
};




// https://iss-flyover.herokuapp.com/json/?lat=YOUR_LAT_INPUT_HERE&lon=YOUR_LON_INPUT_HERE

const fetchISSFlyOverTimes = function(location, callback) {

  request(`https://iss-flyover.herokuapp.com/json/?lat=${location.latitude}&lon=${location.longitude}`, (error, response, body) => {
    //return an error if there is one
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const issPasses = JSON.parse(body).response;
    callback(null, issPasses);
  });
};




/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */


const fetchMyIP = function(callback) {

  // use request to fetch IP address from JSON API
  request('https://api.ipify.org/?format=json', function(error, response, body) {
    // inside the request callback ...
    // error can be set if invalid domain, user is offline, etc.
    if (error) {
      callback(error, null);
      return;
    }

    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    // if we get here, all's well and we got the data

    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });
};



//-------------------------

//  const fetchMyIP = function(callback) {
//   request('https://api.ipify.org?format=json', (error, response, body) => {
//     if (error) return callback(error, null);

//     if (response.statusCode !== 200) {
//       callback(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
//       return;
//     }

//     const ip = JSON.parse(body).ip;
//     callback(null, ip);
//   });
// };




const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};


module.exports = { nextISSTimesForMyLocation };