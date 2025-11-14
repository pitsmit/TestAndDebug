const path = require('path');
const commonPath = path.join(__dirname, '..', '..', 'common');
const service = require(path.join('.', commonPath, 'services', 'AnekdotService'));
//const service = require('../../common/services/AnekdotService');

const apiV1AnekdotsIdDELETE = async (request, reply) => {
  try {
    const result = await service.apiV1AnekdotsIdDELETE(request);
    reply.code(204).send();
  } catch (error) {
    const code = error.statusCode || 500;
    reply.code(code).send({
      code: code,
      message: error.message
    });
  }
};

const apiV1AnekdotsIdPUT = async (request, reply) => {
  try {
    const result = await service.apiV1AnekdotsIdPUT(request);
    reply.code(200).send(result.data);
  } catch (error) {
    const code = error.statusCode || 500;
    reply.code(code).send({
      code: code,
      message: error.message
    });
  }
};

const apiV1AnekdotsPOST = async (request, reply) => {
  try {
    const result = await service.apiV1AnekdotsPOST(request);
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
  apiV1AnekdotsIdDELETE,
  apiV1AnekdotsIdPUT,
  apiV1AnekdotsPOST,
};