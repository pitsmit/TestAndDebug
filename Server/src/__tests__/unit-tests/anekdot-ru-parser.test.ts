import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { AnekdotRuParser } from "@Services/parsers";
import { HTMLMother } from "@Helpers/HTMLMother";
import {parameter, step} from "allure-js-commons";
import {FixturecreateMockCheerioElement} from "@Mocks/cheerio.mock";
export const mockCheerio = require('cheerio');

jest.mock('cheerio', () => ({
    load: jest.fn()
}));

describe('Парсер сайта AnekdotRu', () => {
    let parser: AnekdotRuParser;
    let mockElement: any;
    let HTML: string;
    let htmlbuilder: HTMLMother = new HTMLMother();

    beforeEach(() => {
        parser = new AnekdotRuParser();
        jest.clearAllMocks();
    });

    test('Корректное изъятие текста анекдота с вёрстки', async () => {
        let result: string;
        let expectedText: string;

        /// ARRANGE
        await step('Подготовка тестовых данных', async () => {
            expectedText = 'Это тестовый анекдот с сайта anekdot.ru';

            mockElement = FixturecreateMockCheerioElement(expectedText);
            mockCheerio.load.mockReturnValue(() => mockElement);

            HTML = htmlbuilder.buildAnekdotRuHtml();

            await parameter("Вёрстка", HTML);
            await parameter("Тестовый анекдот", expectedText);
        })

        /// ACT
        await step('Выполнение парсинга', async () => {
            result = parser.parse(HTML);
        })

        /// ASSERT
        await step('Проверка', async () => {
            expect(result).toBe(expectedText);
            expect(mockCheerio.load).toHaveBeenCalledWith(HTML);
            expect(mockElement.text).toHaveBeenCalled();
        })
    });

    test('Изъятие анекдота из кривой вёрстки', async () => {
        let act: any;

        /// ARRANGE
        await step('Подготовка тестовых данных', async () => {
            mockElement = FixturecreateMockCheerioElement('', 0);
            mockCheerio.load.mockReturnValue(() => mockElement);

            HTML = htmlbuilder.buildInvalidStructureHtml();

            await parameter("Вёрстка", HTML);
        })

        /// ACT
        await step('Выполнение парсинга', async () => {
            act = () => parser.parse(HTML);
        })

        /// ASSERT
        await step('Проверка', async () => {
            expect(act).toThrow('Не найдена структура анекдота на странице');
            expect(mockCheerio.load).toHaveBeenCalledWith(HTML);
        })
    });
});