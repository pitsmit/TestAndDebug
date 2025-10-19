import { Experience } from './experience.js';
import inquirer from 'inquirer';

export class ClientExperience extends Experience {
    async main(): Promise<void> {
        console.log('👤 Режим пользователя');

        while (true) {
            const { action } = await inquirer.prompt([
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
            } catch (error: any) {
                console.error('❌ Ошибка:', error.response?.data?.message || error.message);
            }
        }
    }

    private async addToFavourites(): Promise<void> {
        const anekdotId = await this.inputNumber('Введите ID анекдота:');
        await this.client.addToFavourites(anekdotId);
        console.log('✅ Анекдот добавлен в избранное!');
    }

    private async removeFromFavourites(): Promise<void> {
        const anekdotId = await this.inputNumber('Введите ID анекдота:');
        await this.client.removeFromFavourites(anekdotId);
        console.log('✅ Анекдот удален из избранного!');
    }

    private async showFavourites(): Promise<void> {
        let page = 1;
        const limit = 10;

        while (true) {
            try {
                const result = await this.client.getFavourites(page, limit);
                console.log(result)

                console.log(`\n❤️ Избранные анекдоты (страница ${page}):`);
                if (result && result.length > 0) {
                    result.forEach((anekdot: any) => {
                        console.log(`ID: ${anekdot.id} | ${anekdot.hasBadWords ? '🔞' : '✅'} | ${anekdot.text}`);
                    });
                } else {
                    console.log('📭 Анекдотов нет');
                    break;
                }

                const { continueReading } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'continueReading',
                        message: 'Показать ещё?',
                        default: true
                    }
                ]);

                if (continueReading) {
                    page++;
                } else {
                    break;
                }
            } catch (error: any) {
                console.error('❌ Ошибка:', error.response?.data?.message || error.message);
                break;
            }
        }
    }
}