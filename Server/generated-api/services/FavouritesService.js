const Service = require('./Service');

/**
* Получение списка избранных анекдотов
* */
const apiV1FavouritesGET = (request) => new Promise(
  async (resolve, reject) => {
      try {
          const { Facade } = require('../../dist/Facade/Facade');
          const { ShowFavouritesCommand } = require('../../dist/UI/Commands/UserCommands');

          const token = request.headers?.authorization?.replace('Bearer ', '') || null;
          const page = request.query?.page;
          const limit = request.query?.limit;

          const facade = new Facade();
          const command = new ShowFavouritesCommand(token, page, limit);
          await facade.execute(command);

          resolve(Service.successResponse(command._anekdots, 200));
      } catch (error) {
          reject(error);
      }
  },
);
/**
* Удаление анекдота из избранного по id
* */
const apiV1FavouritesIdDELETE = (request) => new Promise(
  async (resolve, reject) => {
      try {
          const { Facade } = require('../../dist/Facade/Facade');
          const { DeleteFromFavouritesCommand } = require('../../dist/UI/Commands/UserCommands');

          const token = request.headers?.authorization?.replace('Bearer ', '') || null;
          const anekdot_id = request.params.id;

          const facade = new Facade();
          const command = new DeleteFromFavouritesCommand(token, anekdot_id);
          await facade.execute(command);

          resolve(Service.successResponse(command._anekdots, 204));
      } catch (error) {
          reject(error);
      }
  },
);
/**
* Добавление анекдота в избранное по id
* */
const apiV1FavouritesPOST = (request) => new Promise(
  async (resolve, reject) => {
      try {
          const { Facade } = require('../../dist/Facade/Facade');
          const { AddToFavouritesCommand } = require('../../dist/UI/Commands/UserCommands');

          const token = request.headers?.authorization?.replace('Bearer ', '') || null;
          const id = request.body?.anekdot_id;

          const facade = new Facade();
          const command = new AddToFavouritesCommand(token, id);
          await facade.execute(command);

          resolve(Service.successResponse(command.anekdot, 201));
      } catch (error) {
          reject(error);
      }
  },
);

module.exports = {
  apiV1FavouritesGET,
  apiV1FavouritesIdDELETE,
  apiV1FavouritesPOST,
};
