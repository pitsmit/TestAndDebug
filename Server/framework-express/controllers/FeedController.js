const service = require('../../common/services/FeedService');

const apiV1FeedGET = async (request, response) => {
  try {
    const result = await service.apiV1FeedGET(request);
    response.status(200).json(result);
  } catch (error) {
    const code = error.statusCode || 500;
    response.status(code).json({
      code: code,
      message: error.message
    });
  }
};

module.exports = {
  apiV1FeedGET,
};