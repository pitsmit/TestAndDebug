const Service = require('./Service');

const apiV1FeedGET = ({ page, limit }) => new Promise(
    async (resolve, reject) => {
        try {
            const { Facade } = require('../../dist/Facade/Facade');
            const { ShowLentaCommand } = require('../../dist/Commands/LentaCommands');

            const facade = new Facade();
            const command = new ShowLentaCommand(page, limit);
            await facade.execute(command);
            const anekdots = command._anekdots;

            resolve(Service.successResponse(anekdots));
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
    apiV1FeedGET,
};