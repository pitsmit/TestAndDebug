import { TestServerManager } from '@/__tests__/helpers/test-server-utils';

const testServerManager = new TestServerManager(3000);

beforeAll(async () => {
    await testServerManager.start();
}, 30000);

afterAll(async () => {
    await testServerManager.stop();
}, 30000);

export { testServerManager };