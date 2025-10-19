import { Experience } from './experience.js';
import inquirer from 'inquirer';
import {AdminExperience} from "./admin-experience";
import {ClientExperience} from "./client-experience";

export class VisitorExperience extends Experience {
    async main(): Promise<void> {
        while (true) {
            const { action } = await inquirer.prompt([
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
            } catch (error: any) {
                console.error('❌ Ошибка:', error.response?.data?.message || error.message);
            }
        }
    }

    private async login(): Promise<void> {
        const credentials = await inquirer.prompt([
            { type: 'input', name: 'login', message: 'Логин:' },
            { type: 'password', name: 'password', message: 'Пароль:' }
        ]);

        const user = await this.client.login(credentials.login, credentials.password);
        console.log('✅ Успешный вход!');

        if (user.role === 1) {
            await new AdminExperience(this.client).main();
        } else {
            await new ClientExperience(this.client).main();
        }
    }

    private async register(): Promise<void> {
        const data = await inquirer.prompt([
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

        const user = await this.client.register(
            data.login,
            data.password,
            data.name,
            data.role
        );

        console.log('✅ Успешная регистрация!');

        if (user.role === 1) {
            await new AdminExperience(this.client).main();
        } else {
            await new ClientExperience(this.client).main();
        }
    }
}