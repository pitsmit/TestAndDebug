import { Experience } from './experience.js';
import inquirer from 'inquirer';

export class AdminExperience extends Experience {
    async main(): Promise<void> {
        console.log('👑 Режим администратора');

        while (true) {
            const { action } = await inquirer.prompt([
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
            } catch (error: any) {
                console.error('❌ Ошибка:', error.response?.data?.message || error.message);
            }
        }
    }

    private async createAnekdot(): Promise<void> {
        const text = await this.inputText('Введите текст анекдота:');
        await this.client.createAnekdot(text);
        console.log('✅ Анекдот добавлен!');
    }

    private async updateAnekdot(): Promise<void> {
        const id = await this.inputNumber('Введите ID анекдота:');
        const text = await this.inputText('Введите новый текст:');
        await this.client.updateAnekdot(id, text);
        console.log('✅ Анекдот обновлен!');
    }

    private async deleteAnekdot(): Promise<void> {
        const id = await this.inputNumber('Введите ID анекдота:');
        await this.client.deleteAnekdot(id);
        console.log('✅ Анекдот удален!');
    }
}