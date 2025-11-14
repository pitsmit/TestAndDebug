const service = require('../services/AuthService');

const apiV1LoginPOST = async (request, reply) => {
  try {
    const result = await service.apiV1LoginPOST(request);
    console.log(result);
    reply.code(result.status).send(result.data);
  } catch (error) {
    const code = error.statusCode || 500;
    reply.code(code).send({
      code: code,
      message: error.message
    });
  }
};

const apiV1RegisterPOST = async (request, reply) => {
  try {
    const result = await service.apiV1RegisterPOST(request);
    reply.code(result.status).send(result.data);
  } catch (error) {
    const code = error.statusCode || 500;
    reply.code(code).send({
      code: code,
      message: error.message
    });
  }
};

module.exports = {
  apiV1LoginPOST,
  apiV1RegisterPOST,
};