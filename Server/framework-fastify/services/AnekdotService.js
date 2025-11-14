/**
 * Удаление анекдота по id
 * */
const apiV1AnekdotsIdDELETE = (request) => new Promise(
    async (resolve, reject) => {
        try {
            const token = request.headers?.authorization?.replace('Bearer ', '') ||
                request.headers?.authorization || null;
            const id = request.params?.id || request.params?.id;

            const { Facade } = require('../../dist/Facade/Facade');
            const { DeleteAnekdotCommand } = require('../../dist/Commands/AdminCommands');
            const facade = new Facade();
            const command = new DeleteAnekdotCommand(token, id);
            await facade.execute(command);

            resolve({
                data: null,
                status: 204
            });
        } catch (error) {
            reject(error);
        }
    },
);

/**
 * Редактирование анекдота по id
 */
const apiV1AnekdotsIdPUT = (request) => new Promise(
    async (resolve, reject) => {
        try {
            const token = request.headers?.authorization?.replace('Bearer ', '') ||
                request.headers?.authorization || null;
            const id = request.params?.id || request.params?.id;
            const new_text = request.body?.text || request.body?.text;

            const { Facade } = require('../../dist/Facade/Facade');
            const { EditAnekdotCommand } = require('../../dist/Commands/AdminCommands');
            const facade = new Facade();
            const command = new EditAnekdotCommand(token, id, new_text);
            await facade.execute(command);

            resolve({
                data: command.anekdot,
                status: 200
            });
        } catch (error) {
            reject(error);
        }
    },
);

/**
 * Загрузка нового анекдота
 */
const apiV1AnekdotsPOST = (request) => new Promise(
    async (resolve, reject) => {
        try {
            const anekdot_text = request.body?.text || request.body?.text;
            const token = request.headers?.authorization?.replace('Bearer ', '') ||
                request.headers?.authorization || null;

            const { Facade } = require('../../dist/Facade/Facade');
            const { LoadAnekdotCommand } = require('../../dist/Commands/AdminCommands');
            const facade = new Facade();
            const command = new LoadAnekdotCommand(token, anekdot_text);
            await facade.execute(command);

            resolve({
                data: command.anekdot,
                status: 201
            });
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