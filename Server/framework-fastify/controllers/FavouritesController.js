const service = require('../services/FavouritesService');

const apiV1FavouritesGET = async (request, reply) => {
  try {
    const result = await service.apiV1FavouritesGET(request);
    reply.code(200).send(result.data);
  } catch (error) {
    const code = error.statusCode || 500;
    reply.code(code).send({
      code: code,
      message: error.message
    });
  }
};

const apiV1FavouritesIdDELETE = async (request, reply) => {
  try {
    const result = await service.apiV1FavouritesIdDELETE(request);
    reply.code(204).send();
  } catch (error) {
    const code = error.statusCode || 500;
    reply.code(code).send({
      code: code,
      message: error.message
    });
  }
};

const apiV1FavouritesPOST = async (request, reply) => {
  try {
    const result = await service.apiV1FavouritesPOST(request);
    reply.code(201).send(result.data);
  } catch (error) {
    const code = error.statusCode || 500;
    reply.code(code).send({
      code: code,
      message: error.message
    });
  }
};

module.exports = {
  apiV1FavouritesGET,
  apiV1FavouritesIdDELETE,
  apiV1FavouritesPOST,
};