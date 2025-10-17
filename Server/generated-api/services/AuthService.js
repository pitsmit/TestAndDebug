/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Вход в аккаунт
*
* loginRequest LoginRequest 
* returns Person
* */
const apiV1LoginPOST = ({ loginRequest }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        loginRequest,
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
* Регистрация пользователя
*
* registrationRequest RegistrationRequest 
* returns Person
* */
const apiV1RegisterPOST = ({ registrationRequest }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        registrationRequest,
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
  apiV1LoginPOST,
  apiV1RegisterPOST,
};
