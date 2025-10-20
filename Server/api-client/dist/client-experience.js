"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientExperience = void 0;
const experience_js_1 = require("./experience.js");
const inquirer_1 = __importDefault(require("inquirer"));
class ClientExperience extends experience_js_1.Experience {
    async main() {
        console.log('👤 Режим пользователя');
        while (true) {
            const { action } = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Выберите действие:',
                    choices: [
                        { name: '➕ Добавить анекдот в избранное', value: 'add_favourite' },
                        { name: '➖ Удалить анекдот из избранного', value: 'remove_favourite' },
                        { name: '📜 Просмотреть ленту', value: 'lenta' },
                        { name: '❤️ Просмотреть избранное', value: 'favourites' },
                        { name: '🚪 Выйти', value: 'exit' }
                    ]
                }
            ]);
            try {
                switch (action) {
                    case 'add_favourite':
                        await this.addToFavourites();
                        break;
                    case 'remove_favourite':
                        await this.removeFromFavourites();
                        break;
                    case 'lenta':
                        await this.showLenta();
                        break;
                    case 'favourites':
                        await this.showFavourites();
                        break;
                    case 'exit':
                        console.log('👋 До свидания!');
                        return;
                }
            }
            catch (error) {
                console.error('❌ Ошибка:', error.response?.data?.message || error.message);
            }
        }
    }
    async addToFavourites() {
        const anekdotId = await this.inputNumber('Введите ID анекдота:');
        await this.client.addToFavourites(anekdotId);
        console.log('✅ Анекдот добавлен в избранное!');
    }
    async removeFromFavourites() {
        const anekdotId = await this.inputNumber('Введите ID анекдота:');
        await this.client.removeFromFavourites(anekdotId);
        console.log('✅ Анекдот удален из избранного!');
    }
    async showFavourites() {
        let page = 1;
        const limit = 10;
        while (true) {
            try {
                const result = await this.client.getFavourites(page, limit);
                console.log(result);
                console.log(`\n❤️ Избранные анекдоты (страница ${page}):`);
                if (result && result.length > 0) {
                    result.forEach((anekdot) => {
                        console.log(`ID: ${anekdot.id} | ${anekdot.hasBadWords ? '🔞' : '✅'} | ${anekdot.text}`);
                    });
                }
                else {
                    console.log('📭 Анекдотов нет');
                    break;
                }
                const { continueReading } = await inquirer_1.default.prompt([
                    {
                        type: 'confirm',
                        name: 'continueReading',
                        message: 'Показать ещё?',
                        default: true
                    }
                ]);
                if (continueReading) {
                    page++;
                }
                else {
                    break;
                }
            }
            catch (error) {
                console.error('❌ Ошибка:', error.response?.data?.message || error.message);
                break;
            }
        }
    }
}
exports.ClientExperience = ClientExperience;
