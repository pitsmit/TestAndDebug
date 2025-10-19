import { ApiClient } from './api-client';
import inquirer from 'inquirer';

export abstract class Experience {
    public constructor(protected client: ApiClient) {}

    protected async inputNumber(message: string): Promise<number> {
        const { answer } = await inquirer.prompt([
            {
                type: 'input',
                name: 'answer',
                message,
                validate: (input: string) => {
                    const num = Number(input);
                    return !isNaN(num) ? true : 'Пожалуйста, введите число';
                }
            }
        ]);
        return Number(answer);
    }

    protected async inputText(message: string): Promise<string> {
        const { answer } = await inquirer.prompt([
            {
                type: 'input',
                name: 'answer',
                message
            }
        ]);
        return answer;
    }

    protected async showLenta(): Promise<void> {
        let page = 1;
        const limit = 10;

        while (true) {
            try {
                const result = await this.client.getAnekdots(page, limit);

                console.log(`\n📜 Лента анекдотов (страница ${page}):`);

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
                        message: 'Показать следующую страницу?',
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

    abstract main(): Promise<void>;
}