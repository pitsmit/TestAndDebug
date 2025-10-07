import { Person } from "@Core/Essences/person";
import { VisitorExperience } from "@/UI/TechUI/Experience";
import { Facade } from "@Facade/Facade";

export class ConsoleApp {
    public async start(): Promise<void> {
        try {
            const visitor = new Person();
            const facade = new Facade();
            const app = new VisitorExperience(facade, visitor);
            await app.main();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}