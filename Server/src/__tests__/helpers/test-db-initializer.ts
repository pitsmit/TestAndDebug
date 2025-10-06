import { TestDBHelper } from "./DBTestHelper";

(async () => {
    const testDBHelper = new TestDBHelper();
    try {
        await testDBHelper.ensureTestDatabase();
        console.log('✅ Test database initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize test database:', error);
        process.exit(1);
    }
})();