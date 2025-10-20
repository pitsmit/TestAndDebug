"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminExperience = void 0;
const experience_js_1 = require("./experience.js");
const inquirer_1 = __importDefault(require("inquirer"));
class AdminExperience extends experience_js_1.Experience {
    async main() {
        console.log('👑 Режим администратора');
        while (true) {
            const { action } = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Выберите действие:',
                    choices: [
                        { name: '📝 Добавить анекдот', value: 'create' },
                        { name: '✏️ Редактировать анекдот', value: 'update' },
                        { name: '🗑️ Удалить анекдот', value: 'delete' },
                        { name: '📜 Просмотреть ленту', value: 'lenta' },
                        { name: '🚪 Выйти', value: 'exit' }
                    ]
                }
            ]);
            try {
                switch (action) {
                    case 'create':
                        await this.createAnekdot();
                        break;
                    case 'update':
                        await this.updateAnekdot();
                        break;
                    case 'delete':
                        await this.deleteAnekdot();
                        break;
                    case 'lenta':
                        await this.showLenta();
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
    async createAnekdot() {
        const text = await this.inputText('Введите текст анекдота:');
        await this.client.createAnekdot(text);
        console.log('✅ Анекдот добавлен!');
    }
    async updateAnekdot() {
        const id = await this.inputNumber('Введите ID анекдота:');
        const text = await this.inputText('Введите новый текст:');
        await this.client.updateAnekdot(id, text);
        console.log('✅ Анекдот обновлен!');
    }
    async deleteAnekdot() {
        const id = await this.inputNumber('Введите ID анекдота:');
        await this.client.deleteAnekdot(id);
        console.log('✅ Анекдот удален!');
    }
}
exports.AdminExperience = AdminExperience;
