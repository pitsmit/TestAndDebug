import {ROLE} from "@shared/types/roles";

export class AuthDataMother {
    CreateValidUserData() {
        return {
            id: 1,
            login: 'new_login',
            password: 'password',
            name: 'name',
            role: ROLE.ADMIN
        };
    }

    CreateBusyLoginData() {
        return {
            id: 1,
            login: 'busy_login',
            password: 'password',
            name: 'name',
            role: ROLE.ADMIN
        };
    }
}