/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Получение списка избранных анекдотов
*
* page Integer  (optional)
* limit Integer  (optional)
* returns List
* */
const apiV1FavouritesGET = ({ page, limit }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        page,
        limit,
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
* Удаление анекдота из избранного по id
*
* id Integer Идентификатор анекдота
* no response value expected for this operation
* */
const apiV1FavouritesIdDELETE = ({ id }) => new Promise(
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
* Добавление анекдота в избранное по id
*
* addToFavouritesRequest AddToFavouritesRequest 
* returns Anekdot
* */
const apiV1FavouritesPOST = ({ addToFavouritesRequest }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        addToFavouritesRequest,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  apiV1FavouritesGET,
  apiV1FavouritesIdDELETE,
  apiV1FavouritesPOST,
};
