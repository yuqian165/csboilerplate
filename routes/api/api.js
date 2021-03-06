/**
 * Created by cshao on 1/12/16.
 */

"use strict";

var express = require('express');
var request = require('request');
var router = express.Router();

var endpoint = require('../../config/constants').ENDPOINT;
var normalize = require('../../utils/normalize');

var secureAPI = require('./secure/api');

// example of forward GET request to endpoint
router.get('/sampleConnectReqURL', function(req, res) {
  req.pipe(request(endpoint + '/api/sampleReqURL')).pipe(normalize['/api/sampleConnectReqURL'](res));
});

// example of forward POST request to endpoint
router.post('/samplePOSTReqURL', function(req, res) {
  request.post(utils.getRequestTargetOption(endpoint + '/api/urlInEndpoint', req)).pipe(res);
});

router.use('/secure', secureAPI);

module.exports = router;