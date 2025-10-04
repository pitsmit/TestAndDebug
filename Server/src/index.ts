import 'dotenv/config';
import { Person } from "@Core/Essences/person";
import { VisitorExperience } from "@/UI/TechUI/Experience";
import { Facade } from "@Facade/Facade";

const bootstrap = async (): Promise<void> => {
    try {
        const visitor = new Person();
        const facade = new Facade();
        const app = new VisitorExperience(facade, visitor);
        await app.main();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

process.on('SIGINT', () => {
    process.exit(0);
});

process.on('SIGTERM', () => {
    process.exit(0);
});

bootstrap()
    .catch(error => {
        console.error(error);
        process.exit(1);
    });