/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Удаление анекдота по id
*
* id Integer Идентификатор анекдота
* no response value expected for this operation
* */
const apiV1AnekdotsIdDELETE = ({ id }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        id,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Редактирование анекдота по id
*
* id Integer Идентификатор анекдота
* updateAnekdotRequest UpdateAnekdotRequest 
* returns Anekdot
* */
const apiV1AnekdotsIdPUT = ({ id, updateAnekdotRequest }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        id,
        updateAnekdotRequest,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
 * Загрузка нового анекдота
 *
 * createAnekdotRequest CreateAnekdotRequest
 * returns Anekdot
 * */
const apiV1AnekdotsPOST = (request) => new Promise(
    async (resolve, reject) => {
        try {
            const { Facade } = require('../../dist/Facade/Facade');
            const { LoadAnekdotCommand } = require('../../dist/UI/Commands/AdminCommands');

            const createAnekdotRequest = request.body;
            const token = request.headers?.authorization?.replace('Bearer ', '') || null;

            if (!token) {
                return reject(Service.rejectResponse(
                    'Токен не предоставлен',
                    401
                ));
            }

            const facade = new Facade();
            const command = new LoadAnekdotCommand(token, createAnekdotRequest.text.trim());
            await facade.execute(command);

            const createdAnekdot = command.anekdot;

            if (!createdAnekdot) {
                return reject(Service.rejectResponse(
                    'Не удалось создать анекдот',
                    500
                ));
            }

            resolve(Service.successResponse(createdAnekdot, 201));

        } catch (error) {
            let status = error.statusCode || 500;
            let message = error.message || 'Внутренняя ошибка сервера';

            if (error.statusCode) {
                reject(Service.rejectResponse(message, status));
            }
        }
    },
);

module.exports = {
  apiV1AnekdotsIdDELETE,
  apiV1AnekdotsIdPUT,
  apiV1AnekdotsPOST,
};
