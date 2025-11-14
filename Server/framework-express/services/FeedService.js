const apiV1FeedGET = (request) => new Promise(
    async (resolve, reject) => {
        try {
            const page = request.query?.page || 1;
            const limit = request.query?.limit || 10;

            const { Facade } = require('../../dist/Facade/Facade');
            const { ShowLentaCommand } = require('../../dist/Commands/LentaCommands');
            const facade = new Facade();
            const command = new ShowLentaCommand(page, limit);
            await facade.execute(command);
            const anekdots = command._anekdots;

            resolve(anekdots);
        } catch (error) {
            reject(error);
        }
    },
);

module.exports = {
    apiV1FeedGET,
};