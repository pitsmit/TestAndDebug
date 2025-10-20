"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorExperience = void 0;
const experience_js_1 = require("./experience.js");
const inquirer_1 = __importDefault(require("inquirer"));
const admin_experience_1 = require("./admin-experience");
const client_experience_1 = require("./client-experience");
class VisitorExperience extends experience_js_1.Experience {
    async main() {
        while (true) {
            const { action } = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Выберите действие:',
                    choices: [
                        { name: '📜 Просмотреть ленту анекдотов', value: 'lenta' },
                        { name: '🔐 Войти в систему', value: 'login' },
                        { name: '📝 Зарегистрироваться', value: 'register' },
                        { name: '🚪 Выйти', value: 'exit' }
                    ]
                }
            ]);
            try {
                switch (action) {
                    case 'lenta':
                        await this.showLenta();
                        break;
                    case 'login':
                        await this.login();
                        break;
                    case 'register':
                        await this.register();
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
    async login() {
        const credentials = await inquirer_1.default.prompt([
            { type: 'input', name: 'login', message: 'Логин:' },
            { type: 'password', name: 'password', message: 'Пароль:' }
        ]);
        const user = await this.client.login(credentials.login, credentials.password);
        console.log('✅ Успешный вход!');
        if (user.role === 1) {
            await new admin_experience_1.AdminExperience(this.client).main();
        }
        else {
            await new client_experience_1.ClientExperience(this.client).main();
        }
    }
    async register() {
        const data = await inquirer_1.default.prompt([
            { type: 'input', name: 'login', message: 'Логин:' },
            { type: 'password', name: 'password', message: 'Пароль:' },
            { type: 'input', name: 'name', message: 'Отображаемое имя:' },
            {
                type: 'list',
                name: 'role',
                message: 'Роль:',
                choices: [
                    { name: '👤 Пользователь', value: 0 },
                    { name: '👑 Администратор', value: 1 }
                ]
            }
        ]);
        const user = await this.client.register(data.login, data.password, data.name, data.role);
        console.log('✅ Успешная регистрация!');
        if (user.role === 1) {
            await new admin_experience_1.AdminExperience(this.client).main();
        }
        else {
            await new client_experience_1.ClientExperience(this.client).main();
        }
    }
}
exports.VisitorExperience = VisitorExperience;
