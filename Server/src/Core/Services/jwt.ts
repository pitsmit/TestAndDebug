import {injectable} from "inversify";
import jwt from 'jsonwebtoken';
import {logger} from "@Core/Services/logger";

export interface IAuthService {
    generateToken(id: number): string;
    verifyToken(token: string): number;
}

@injectable()
export class AuthService implements IAuthService {
    generateToken(id: number): string {
        return jwt.sign({ id: id }, process.env.JWT_SECRET!, { expiresIn: '30d', algorithm: 'HS512' });
    }

    verifyToken(token: string): number {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        const msg: string = `Некорректный токен`;

        if (typeof decoded !== 'object' || decoded === null || !('id' in decoded)) {
            logger.error(msg);
            throw new Error(msg);
        }

        return decoded.id;
    }
}