import { Person } from "@Core/Essences/person";
import { VisitorExperience } from "@/UI/TechUI/Experience";
import { Facade } from "@Facade/Facade";
import {ROLE} from "@shared/types/roles";

export class ConsoleApp {
    public async start(): Promise<void> {
        try {
            const visitor = new Person("token", "name", ROLE.VISITOR);
            const facade = new Facade();
            const app = new VisitorExperience(facade, visitor);
            await app.main();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}