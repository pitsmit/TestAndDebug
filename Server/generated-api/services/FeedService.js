const Service = require('./Service');

const apiV1FeedGET = ({ page, limit }) => new Promise(
    async (resolve, reject) => {
        try {
            console.log('🔄 FeedService: Starting with DB connection test...');

            // Сначала проверим подключение к БД
            const { Pool } = require('pg');
            const testPool = new Pool({
                host: process.env.HOST || 'localhost',
                port: process.env.PORT || 5432,
                database: process.env.DATABASE_NAME || 'anekdot_test',
                user: process.env.USER || 'postgres',
                password: process.env.PASSWORD || 'password'
            });

            try {
                console.log('🔄 Testing DB connection...');
                await testPool.query('SELECT 1');
                console.log('✅ DB connection successful');
                await testPool.end();
            } catch (dbError) {
                await testPool.end();
                console.error('❌ DB connection failed:', dbError.message);
                throw new Error(`Database connection failed: ${dbError.message}`);
            }

            const { Facade } = require('../../dist/Facade/Facade');
            const { ShowLentaCommand } = require('../../dist/Commands/LentaCommands');

            console.log('🔄 FeedService: Creating facade and command...');

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