const service = require('../../common/services/FeedService');

const apiV1FeedGET = async (request, reply) => {
  try {
    return await service.apiV1FeedGET(request);
  } catch (error) {
    const code = error.statusCode || 500;
    reply.code(code).send({
      code: code,
      message: error.message
    });
  }
};


module.exports = {
  apiV1FeedGET,
};


