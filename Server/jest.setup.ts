import 'reflect-metadata';

beforeEach(() => {
    const testName = expect.getState().currentTestName || 'unknown test';
    console.log(`[PID:${process.pid}] Running: ${testName}`);
});

beforeAll(() => {
    console.log(`[PID:${process.pid}] Test file started: ${__filename}`);
});

afterAll(() => {
    console.log(`[PID:${process.pid}] Test file completed: ${__filename}`);
});