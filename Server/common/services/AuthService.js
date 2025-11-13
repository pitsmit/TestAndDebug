const Service = require('./Service');

/**
* Вход в аккаунт
* */
const apiV1LoginPOST = (request) => new Promise(
    async (resolve, reject) => {
        try {
            const { login, password } = request.body;

            const { Facade } = require('../../dist/Facade/Facade');
            const { EntryCommand } = require('../../dist/Commands/AuthCommands');
            const facade = new Facade();
            const command = new EntryCommand(login, password);
            await facade.execute(command);
            const user = command.person;

            resolve(Service.successResponse({
                user
            }, 200));

        } catch (error) {
            reject(error);
        }
    }
);
/**
* Регистрация пользователя
* */
const apiV1RegisterPOST = (request) => new Promise(
  async (resolve, reject) => {
      try {
          const { login, password, name, role } = request.body;

          const { Facade } = require('../../dist/Facade/Facade');
          const { RegistrateCommand } = require('../../dist/Commands/AuthCommands');
          const facade = new Facade();
          const command = new RegistrateCommand(login, password, name, role);
          await facade.execute(command);
          const user = command.person;

          resolve(Service.successResponse({
              user
          }, 201));

      } catch (error) {
          reject(error);
      }
  },
);

module.exports = {
  apiV1LoginPOST,
  apiV1RegisterPOST,
};
