import {injectable} from "inversify";
import jwt from 'jsonwebtoken';
import {logger} from "@Core/Services/logger";

export interface IAuthService {
    generateToken(login: string): string;
    verifyToken(token: string): { log: string };
}

@injectable()
export class AuthService implements IAuthService {
    generateToken(login: string): string {
        return jwt.sign({ log: login }, process.env.JWT_SECRET || "", { expiresIn: '30d', algorithm: 'HS512' });
    }

    verifyToken(token: string): { log: string } {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "");

        const msg: string = `Некорректный токен`;

        if (typeof decoded !== 'object' || decoded === null) {
            logger.error(msg);
            throw new Error(msg);
        }

        if (!('log' in decoded)) {
            logger.error(msg);
            throw new Error(msg);
        }

        return { log: decoded.log };
    }
}