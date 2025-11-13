const service = require('../../common/services/AuthService');

const apiV1LoginPOST = async (request, response) => {
  try {
    const result = await service.apiV1LoginPOST(request);
    response.status(200).json(result);
  } catch (error) {
    const code = error.statusCode || 500;
    response.status(code).json({
      code: code,
      message: error.message
    });
  }
};

const apiV1RegisterPOST = async (request, response) => {
  try {
    const result = await service.apiV1RegisterPOST(request);
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
  apiV1LoginPOST,
  apiV1RegisterPOST,
};