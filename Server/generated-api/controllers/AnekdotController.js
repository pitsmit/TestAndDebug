/**
 * The AnekdotController file is a very simple one, which does not need to be changed manually,
 * unless there's a case where business logic routes the request to an entity which is not
 * the service.
 * The heavy lifting of the Controller item is done in Request.js - that is where request
 * parameters are extracted and sent to the service, and where response is handled.
 */

const Controller = require('./Controller');
const service = require('../services/AnekdotService');
const apiV1AnekdotsIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.apiV1AnekdotsIdDELETE);
};

const apiV1AnekdotsIdPUT = async (request, response) => {
  await Controller.handleRequest(request, response, service.apiV1AnekdotsIdPUT);
};

const apiV1AnekdotsPOST = async (request, response) => {
  try {
    const result = await service.apiV1AnekdotsPOST(request);
    response.status(201).json(result);
  } catch (error) {
    response.status(error.statusCode || 500).json({
      code: error.statusCode || 500,
      message: error.message
    });
  }
};


module.exports = {
  apiV1AnekdotsIdDELETE,
  apiV1AnekdotsIdPUT,
  apiV1AnekdotsPOST,
};
