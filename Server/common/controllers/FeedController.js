const Controller = require('./Controller');
const service = require('../services/FeedService');
const apiV1FeedGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.apiV1FeedGET);
};


module.exports = {
  apiV1FeedGET,
};
