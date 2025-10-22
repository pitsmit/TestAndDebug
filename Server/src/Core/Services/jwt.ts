import {injectable} from "inversify";
import jwt from 'jsonwebtoken';
import {BadTokenError, ErrorFactory, PermissionError} from "@Essences/Errors";

export interface IAuthService {
    generateToken(id: number, role: number): string;
    verifyToken(token: string): { id: number, role: number };
    checkRole(token: string, expected_role: number): void;
}

@injectable()
export class AuthService implements IAuthService {
    generateToken(id: number, role: number): string {
        return jwt.sign(
            { id, role },
            process.env.JWT_SECRET!,
            { expiresIn: '30d', algorithm: 'HS512' }
        );
    }

    verifyToken(token: string): { id: number, role: number } {
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        } catch (e) {
            if (typeof decoded !== 'object' || decoded === null || !('id' in decoded) || !('role' in decoded)) {
                throw ErrorFactory.create(BadTokenError);
            }
        }

        return {
            id: decoded.id,
            role: decoded.role
        };
    }

    checkRole(token: string, expected_role: number): void {
        const { role } = this.verifyToken(token);
        if (role !== expected_role) throw ErrorFactory.create(PermissionError);
    }
}