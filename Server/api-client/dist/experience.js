"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Experience = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
class Experience {
    constructor(client) {
        this.client = client;
    }
    async inputNumber(message) {
        const { answer } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'answer',
                message,
                validate: (input) => {
                    const num = Number(input);
                    return !isNaN(num) ? true : 'Пожалуйста, введите число';
                }
            }
        ]);
        return Number(answer);
    }
    async inputText(message) {
        const { answer } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'answer',
                message
            }
        ]);
        return answer;
    }
    async showLenta() {
        let page = 1;
        const limit = 10;
        while (true) {
            try {
                const result = await this.client.getAnekdots(page, limit);
                console.log(`\n📜 Лента анекдотов (страница ${page}):`);
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
                        message: 'Показать следующую страницу?',
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
exports.Experience = Experience;
