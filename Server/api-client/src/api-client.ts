import axios, { AxiosInstance } from 'axios';

export class ApiClient {
    private client: AxiosInstance;

    constructor(baseURL: string = 'http://localhost:8080/api/v1') {
        this.client = axios.create({
            baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    setToken(token: string): void {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    async login(login: string, password: string): Promise<any> {
        const response = await this.client.post('/login', { login, password });
        this.setToken(response.data.payload.user.token);
        return response.data.payload.user;
    }

    async register(login: string, password: string, name: string, role: number): Promise<any> {
        const response = await this.client.post('/register', {
            login, password, name, role
        });
        this.setToken(response.data.payload.user.token);
        return response.data.payload.user;
    }

    async getAnekdots(page: number = 1, limit: number = 10): Promise<any> {
        const response = await this.client.get('/feed', {
            params: { page, limit }
        });
        return response.data;
    }

    async getFavourites(page: number = 1, limit: number = 10): Promise<any> {
        const response = await this.client.get('/favourites', {
            params: { page, limit }
        });
        return response.data.payload;
    }

    async addToFavourites(anekdotId: number): Promise<any> {
        const response = await this.client.post('/favourites', {
            anekdot_id: anekdotId
        });
        return response.data;
    }

    async removeFromFavourites(anekdotId: number): Promise<any> {
        const response = await this.client.delete(`/favourites/${anekdotId}`);
        return response.data;
    }

    async createAnekdot(text: string): Promise<any> {
        const response = await this.client.post('/anekdots', { text });
        return response.data;
    }

    async updateAnekdot(id: number, text: string): Promise<any> {
        const response = await this.client.put(`/anekdots/${id}`, { text });
        return response.data;
    }

    async deleteAnekdot(id: number): Promise<any> {
        const response = await this.client.delete(`/anekdots/${id}`);
        return response.data;
    }
}