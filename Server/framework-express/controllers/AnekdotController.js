const service = require('../services/AnekdotService');

const apiV1AnekdotsIdDELETE = async (request, response) => {
  try {
    const result = await service.apiV1AnekdotsIdDELETE(request);
    response.status(204).json(result);
  } catch (error) {
    const code = error.statusCode || 500;
    response.status(code).json({
      code: code,
      message: error.message
    });
  }
};

const apiV1AnekdotsIdPUT = async (request, response) => {
  try {
    const result = await service.apiV1AnekdotsIdPUT(request);
    response.status(200).json(result);
  } catch (error) {
    const code = error.statusCode || 500;
    response.status(code).json({
      code: code,
      message: error.message
    });
  }
};

const apiV1AnekdotsPOST = async (request, response) => {
  try {
    const result = await service.apiV1AnekdotsPOST(request);
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
  apiV1AnekdotsIdDELETE,
  apiV1AnekdotsIdPUT,
  apiV1AnekdotsPOST,
};
