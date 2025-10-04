import fs from "fs";
import path from "path";
import pino, { Logger } from "pino";

export interface ILogger {
    fatal(msg: string, ...args: any[]): void;
    error(msg: string, ...args: any[]): void;
    warn(msg: string, ...args: any[]): void;
    info(msg: string, ...args: any[]): void;
    debug(msg: string, ...args: any[]): void;
    trace(msg: string, ...args: any[]): void;
}

export class NodeLogger implements ILogger {
    private readonly logger: Logger;

    constructor(appPath: string) {
        const logLevel = this.setUpLogLevel(path.join(appPath, 'config.json'));
        this.logger = pino(
            {
                level: logLevel,
                timestamp: pino.stdTimeFunctions.isoTime
            },
            pino.destination({
                dest: path.join(appPath, 'app.log'),
                mkdir: true
            })
        );
    }

    private setUpLogLevel(configPath: string): string {
        let logLevel: string = 'info';

        try {
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                if (config.logLevel) {
                    logLevel = config.logLevel;
                }
            }
        } catch (err) {
            console.error('Ошибка при чтении config.json:', err);
        }

        return logLevel;
    }

    public fatal(msg: string, ...args: any[]): void {
        this.logger.fatal(msg, ...args);
    }

    public error(msg: string, ...args: any[]): void {
        this.logger.error(msg, ...args);
    }

    public warn(msg: string, ...args: any[]): void {
        this.logger.warn(msg, ...args);
    }

    public info(msg: string, ...args: any[]): void {
        this.logger.info(msg, ...args);
    }

    public debug(msg: string, ...args: any[]): void {
        this.logger.debug(msg, ...args);
    }

    public trace(msg: string, ...args: any[]): void {
        this.logger.trace(msg, ...args);
    }
}

export const logger: ILogger = new NodeLogger(process.cwd());