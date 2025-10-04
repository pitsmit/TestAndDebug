import {jest} from "@jest/globals";

export const FixturecreateMockCheerioElement = (text: string, length: number = 1) => {
    return {
        length,
        text: jest.fn().mockReturnValue(text)
    };
};