import {Command} from "@UICommands/BaseCommand";
import * as process from "node:process";
import {logger} from "@Core/Services/logger";

export class ExitCommand extends Command{
    async execute(): Promise<void> {
        logger.info("Завершение работы");
        process.exit(0);
    }
}