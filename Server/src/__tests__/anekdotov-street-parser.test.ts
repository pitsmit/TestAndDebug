import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { AnekdotovStreetParser } from "@Core/Services/parsers";
import { HTMLMother } from "./helpers/HTMLMother";
import {parameter, step} from "allure-js-commons";
import {FixturecreateMockCheerioElement} from "@/__tests__/mocks/cheerio.mock";
export const mockCheerio = require('cheerio');

jest.mock('cheerio', () => ({
    load: jest.fn()
}));

describe('Парсер сайта AnekdotovStreet', () => {
    let parser: AnekdotovStreetParser;
    let htmlbuilder: HTMLMother = new HTMLMother();

    beforeEach(() => {
        parser = new AnekdotovStreetParser();
        jest.clearAllMocks();
    });

    test('Корректное изъятие текста анекдота с вёрстки', async () => {
        let expectedText: string;
        let mockElement: any;
        let HTML: string;
        let result: string;

        /// ARRANGE
        await step('Подготовка тестовых данных', async () => {
            expectedText = 'Это тестовый анекдот с сайта anekdotovstreet.com';

            mockElement = FixturecreateMockCheerioElement(expectedText);
            mockCheerio.load.mockReturnValue(() => mockElement);

            HTML = htmlbuilder.buildAnekdotovStreetHtml();

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
            expect(mockCheerio.load).toHaveBeenCalledWith(htmlbuilder.buildAnekdotovStreetHtml());
            expect(mockElement.text).toHaveBeenCalled();
        })
    });
});