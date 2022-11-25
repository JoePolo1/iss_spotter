//requiring request promise native
const request = require('request-promise-native');

/**
 * Requests user's ip address from https://ipify.org/
 * Input: None
 * Returns: Promise of request for ip data, returned as a JSON string
 */

const fetchMyIP = function()  {
  return request('https://api.ipify.org?format=json');
};

const fetchCoordsByIP = function(body)  {
  const ip = JSON.parse(body).ip;
  return request(`http://ipwho.is/${ip}`)
};

const fetchISSFlyOverTimes = function(body) {
  const { latitude, longitude } = JSON.parse(body);
  // console.log(typeof request(`https://iss-flyover.herokuapp.com/json/?lat=${latitude}&lon=${longitude}`));
  return request(`https://iss-flyover.herokuapp.com/json/?lat=${latitude}&lon=${longitude}`);
};


/* 
 * Input: None
 * Returns: Promise for fly over data for users location
 */
const nextISSTimesForMyLocation = function() {
  return fetchMyIP()
    .then(fetchCoordsByIP)
    .then(fetchISSFlyOverTimes)
    .then((data) => {
      const { response } = JSON.parse(data);
      return response;
    });
};

module.exports = { nextISSTimesForMyLocation  };


