'use strict';
module.exports = function(server) {
  // Install a `/` route that returns server status
  const https = require('https');
  var router = server.loopback.Router();
  router.get('/authFacebook', function(req, res) {
    var code = req.query['code'];
    var appId = '479268405800148'
    var redirectURI = 'http://localhost:3000/authFacebook'
    var appSecret = 'f6db6f6d5f0bd4d10e7af796a73a329e'
    console.log(code);
    https.get('https://graph.facebook.com/v2.10/oauth/access_token?' +
        'client_id=' + appId + 
        '&redirect_uri=' + redirectURI +
        '&client_secret=' + appSecret +
        '&code=' + code, 
    (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];
      
        let error;
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
          error = new Error('Invalid content-type.\n' +
                            `Expected application/json but received ${contentType}`);
        }
        if (error) {
          console.error(error.message);
          // consume response data to free up memory
          res.resume();
          return;
        }
      
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            // Si esta todo bien verifico los datos del token
            https.get('https://graph.facebook.com/debug_token?' +
                'input_token=' + rawData['access_token'] +
                '&access_token=' + appSecret,
                (res) => {
                    const { statusCode } = res;
                    const contentType = res.headers['content-type'];
                  
                    let error;
                    if (statusCode !== 200) {
                      error = new Error('Request Failed.\n' +
                                        `Status Code: ${statusCode}`);
                    } else if (!/^application\/json/.test(contentType)) {
                      error = new Error('Invalid content-type.\n' +
                                        `Expected application/json but received ${contentType}`);
                    }
                    if (error) {
                      console.error(error.message);
                      // consume response data to free up memory
                      res.resume();
                      return;
                    }
                  
                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => { rawData += chunk; });
                    res.on('end', () => {
                      try {
                        const parsedData = JSON.parse(rawData);
                        console.log(parsedData);
                      } catch (e) {
                        console.error(e.message);
                      }
                    });
                }).on('error', (e) => {
                    console.error(`Got error: ${e.message}`);
                });           
            console.log(parsedData);
          } catch (e) {
            console.error(e.message);
          }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
  });
  server.use(router);
};