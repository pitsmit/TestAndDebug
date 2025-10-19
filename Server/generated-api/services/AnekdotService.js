const Service = require('./Service');

/**
* Удаление анекдота по id
* */
const apiV1AnekdotsIdDELETE = (request) => new Promise(
    async (resolve, reject) => {
        try {
            const { Facade } = require('../../dist/Facade/Facade');
            const { DeleteAnekdotCommand } = require('../../dist/Commands/AdminCommands');

            const token = request.headers?.authorization?.replace('Bearer ', '') || null;
            const id = request.params.id;

            const facade = new Facade();
            const command = new DeleteAnekdotCommand(token, id);
            await facade.execute(command);

            resolve(Service.successResponse(null, 204));
        } catch (error) {
            reject(error);
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
const apiV1AnekdotsIdPUT = (request) => new Promise(
  async (resolve, reject) => {
      try {
          const { Facade } = require('../../dist/Facade/Facade');
          const { EditAnekdotCommand } = require('../../dist/Commands/AdminCommands');

          const token = request.headers?.authorization?.replace('Bearer ', '') || null;
          const id = request.params.id;
          const new_text = request.body.text;

          const facade = new Facade();
          const command = new EditAnekdotCommand(token, id, new_text);
          await facade.execute(command);

          resolve(Service.successResponse(command.anekdot, 200));
      } catch (error) {
          reject(error);
      }
  },
);
/**
 * Загрузка нового анекдота
 * */
const apiV1AnekdotsPOST = (request) => new Promise(
    async (resolve, reject) => {
        try {
            const { Facade } = require('../../dist/Facade/Facade');
            const { LoadAnekdotCommand } = require('../../dist/Commands/AdminCommands');

            const anekdot_text = request.body.text;
            const token = request.headers?.authorization?.replace('Bearer ', '') || null;

            const facade = new Facade();
            const command = new LoadAnekdotCommand(token, anekdot_text);
            await facade.execute(command);

            resolve(Service.successResponse(command.anekdot, 201));
        } catch (error) {
            reject(error);
        }
    },
);

module.exports = {
  apiV1AnekdotsIdDELETE,
  apiV1AnekdotsIdPUT,
  apiV1AnekdotsPOST,
};
