import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL

axios.defaults.withCredentials = true;

export const AuthService = {

    login: async (data) => {
        try {
            const response = await axios.post('/login', {
                "username": data.username,
                "password": data.password
            }, { baseURL: API_URL });
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                message: error.response.data.error_code
            }
        }
    },

    logout: async () => {
        try {
            const response = await axios.get('/logout', { baseURL: API_URL });
            return {
                success: true,
                message: response.data.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.response.data.error_code
            }
        }
    },
    
    loginUser(data) {
        return this.login(data);
    },

    logoutUser() {
        return this.logout();
    },

};