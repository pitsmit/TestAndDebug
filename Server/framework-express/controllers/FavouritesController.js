const service = require('../services/FavouritesService');

const apiV1FavouritesGET = async (request, response) => {
  try {
    const result = await service.apiV1FavouritesGET(request);
    response.status(200).json(result);
  } catch (error) {
    const code = error.statusCode || 500;
    response.status(code).json({
      code: code,
      message: error.message
    });
  }
};

const apiV1FavouritesIdDELETE = async (request, response) => {
  try {
    const result = await service.apiV1FavouritesIdDELETE(request);
    response.status(204).json(result);
  } catch (error) {
    const code = error.statusCode || 500;
    response.status(code).json({
      code: code,
      message: error.message
    });
  }
};

const apiV1FavouritesPOST = async (request, response) => {
  try {
    const result = await service.apiV1FavouritesPOST(request);
    response.status(201).json(result);
  } catch (error) {
    const code = error.statusCode || 500;
    response.status(code).json({
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
