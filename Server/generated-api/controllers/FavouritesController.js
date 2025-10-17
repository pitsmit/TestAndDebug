/**
 * The FavouritesController file is a very simple one, which does not need to be changed manually,
 * unless there's a case where business logic routes the request to an entity which is not
 * the service.
 * The heavy lifting of the Controller item is done in Request.js - that is where request
 * parameters are extracted and sent to the service, and where response is handled.
 */

const Controller = require('./Controller');
const service = require('../services/FavouritesService');
const apiV1FavouritesGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.apiV1FavouritesGET);
};

const apiV1FavouritesIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.apiV1FavouritesIdDELETE);
};

const apiV1FavouritesPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.apiV1FavouritesPOST);
};


module.exports = {
  apiV1FavouritesGET,
  apiV1FavouritesIdDELETE,
  apiV1FavouritesPOST,
};
