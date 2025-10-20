"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
class ApiClient {
    constructor(baseURL = 'http://localhost:8080/api/v1') {
        this.client = axios_1.default.create({
            baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    setToken(token) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    async login(login, password) {
        const response = await this.client.post('/login', { login, password });
        this.setToken(response.data.payload.user.token);
        return response.data.payload.user;
    }
    async register(login, password, name, role) {
        const response = await this.client.post('/register', {
            login, password, name, role
        });
        this.setToken(response.data.payload.user.token);
        return response.data.payload.user;
    }
    async getAnekdots(page = 1, limit = 10) {
        const response = await this.client.get('/feed', {
            params: { page, limit }
        });
        return response.data;
    }
    async getFavourites(page = 1, limit = 10) {
        const response = await this.client.get('/favourites', {
            params: { page, limit }
        });
        return response.data.payload;
    }
    async addToFavourites(anekdotId) {
        const response = await this.client.post('/favourites', {
            anekdot_id: anekdotId
        });
        return response.data;
    }
    async removeFromFavourites(anekdotId) {
        const response = await this.client.delete(`/favourites/${anekdotId}`);
        return response.data;
    }
    async createAnekdot(text) {
        const response = await this.client.post('/anekdots', { text });
        return response.data;
    }
    async updateAnekdot(id, text) {
        const response = await this.client.put(`/anekdots/${id}`, { text });
        return response.data;
    }
    async deleteAnekdot(id) {
        const response = await this.client.delete(`/anekdots/${id}`);
        return response.data;
    }
}
exports.ApiClient = ApiClient;
