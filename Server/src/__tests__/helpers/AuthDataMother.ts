import {ROLE} from "@shared/types/roles";

export class AuthDataMother {
    CreateValidUserData() {
        return {
            login: 'new_login',
            password: 'password',
            name: 'name',
            role: ROLE.ADMIN
        };
    }

    CreateBusyLoginData() {
        return {
            login: 'busy_login',
            password: 'password',
            name: 'name',
            role: ROLE.ADMIN
        };
    }
}