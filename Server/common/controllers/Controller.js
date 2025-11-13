const fs = require('fs');
const path = require('path');
const camelCase = require('camelcase');
const config = require('../config');

class Controller {
  static sendResponse(response, payload) {
    // Определяем тип фреймворка
    if (response.code) {
      // Fastify - используем reply
      const statusCode = payload.code || 200;
      const responsePayload = payload.payload !== undefined ? payload.payload : payload;
      return response.code(statusCode).send(responsePayload);
    } else {
      // Express - оригинальная логика
      response.status(payload.code || 200);
      const responsePayload = payload.payload !== undefined ? payload.payload : payload;
      if (responsePayload instanceof Object) {
        response.json(responsePayload);
      } else {
        response.end(responsePayload);
      }
    }
  }

  static sendError(response, error) {
    // Определяем тип фреймворка
    if (response.code) {
      // Fastify
      const statusCode = error.code || 500;
      const errorPayload = error.error instanceof Object ? error.error : { message: error.error || error.message };
      return response.code(statusCode).send(errorPayload);
    } else {
      // Express
      response.status(error.code || 500);
      if (error.error instanceof Object) {
        response.json(error.error);
      } else {
        response.end(error.error || error.message);
      }
    }
  }

  static collectFile(request, fieldName) {
    let uploadedFileName = '';

    // Fastify использует request.body для multipart, Express - request.files
    if (request.files && request.files.length > 0) {
      // Express style
      const fileObject = request.files.find((file) => file.fieldname === fieldName);
      if (fileObject) {
        const fileArray = fileObject.originalname.split('.');
        const extension = fileArray.pop();
        fileArray.push(`_${Date.now()}`);
        uploadedFileName = `${fileArray.join('')}.${extension}`;
        fs.renameSync(path.join(config.FILE_UPLOAD_PATH, fileObject.filename),
            path.join(config.FILE_UPLOAD_PATH, uploadedFileName));
      }
    }
    // TODO: Добавить обработку для Fastify multipart
    return uploadedFileName;
  }

  static getRequestBodyName(request) {
    const codeGenDefinedBodyName = request.openapi.schema['x-codegen-request-body-name'];
    if (codeGenDefinedBodyName !== undefined) {
      return codeGenDefinedBodyName;
    }
    const refObjectPath = request.openapi.schema.requestBody.content['application/json'].schema.$ref;
    if (refObjectPath !== undefined && refObjectPath.length > 0) {
      return (refObjectPath.substr(refObjectPath.lastIndexOf('/') + 1));
    }
    return 'body';
  }

  static collectRequestParams(request) {
    const requestParams = {};

    if (request.openapi.schema.requestBody !== null) {
      const { content } = request.openapi.schema.requestBody;
      if (content['application/json'] !== undefined) {
        const requestBodyName = camelCase(this.getRequestBodyName(request));
        requestParams[requestBodyName] = request.body;
      } else if (content['multipart/form-data'] !== undefined) {
        Object.keys(content['multipart/form-data'].schema.properties).forEach(
            (property) => {
              const propertyObject = content['multipart/form-data'].schema.properties[property];
              if (propertyObject.format !== undefined && propertyObject.format === 'binary') {
                requestParams[property] = this.collectFile(request, property);
              } else {
                requestParams[property] = request.body[property];
              }
            },
        );
      }
    }

    if (request.openapi.schema.parameters !== undefined) {
      request.openapi.schema.parameters.forEach((param) => {
        if (param.in === 'path') {
          requestParams[param.name] = request.openapi.pathParams[param.name];
        } else if (param.in === 'query') {
          requestParams[param.name] = request.query[param.name];
        } else if (param.in === 'header') {
          requestParams[param.name] = request.headers[param.name];
        }
      });
    }
    return requestParams;
  }

  static async handleRequest(request, response, serviceOperation) {
    try {
      console.log('Controller: handling request...');
      const serviceResponse = await serviceOperation(this.collectRequestParams(request));
      console.log('Controller: service response:', serviceResponse);
      Controller.sendResponse(response, serviceResponse);
    } catch (error) {
      console.log('Controller: service error:', error);
      Controller.sendError(response, error);
    }
  }
}

module.exports = Controller;