const service = require('../services/AuthService');
const apiV1LoginPOST = async (request, response) => {
  try {
    const result = await service.apiV1LoginPOST(request);
    response.status(200).json(result);
  } catch (error) {
    response.status(error.statusCode || 500).json({
      code: error.statusCode || 500,
      message: error.message
    });
  }
};

const apiV1RegisterPOST = async (request, response) => {
  try {
    const result = await service.apiV1RegisterPOST(request);
    response.status(201).json(result);
  } catch (error) {
    response.status(error.statusCode || 500).json({
      code: error.statusCode || 500,
      message: error.message
    });
  }
};


module.exports = {
  apiV1LoginPOST,
  apiV1RegisterPOST,
};
