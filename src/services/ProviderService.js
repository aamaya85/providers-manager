import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL

export const ProviderService = {

    async getProviderData(id) {
        try {
            const response = await axios.get('/provider/' + id, { baseURL: API_URL });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async getProvidersData() {
        try {
            const response = await axios.get('/provider', { baseURL: API_URL });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    async getUsersData() {
        try {
            const response = await axios.get('/user', { baseURL: API_URL });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async postProvider(provider) {
        try {
            const response = await axios.post('/user', provider, { baseURL: API_URL });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async putUserProvider(provider) {
        try {
            const response = await axios.put('/user/' + provider.user_guid, provider, { baseURL: API_URL });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async putProvider(provider) {
        try {
            const response = await axios.put('/provider/' + provider.user_guid, provider, { baseURL: API_URL });
            console.log(response)
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async softDeleteProvider(guid) {
        return axios.delete('/provider/' + guid, { baseURL: API_URL })
            .then(response => {
                return response.data;
            })
            .catch(error => {
                throw error;
            });
    },

    getProvider(id) {
        return Promise.resolve(this.getProviderData(id));
    },

    getProviders() {
        return Promise.resolve(this.getProvidersData());
    },

    getUsers() {
        return Promise.resolve(this.getUsersData());
    },

    createProvider(data) {
        return Promise.resolve(this.postProvider(data));
    },

    updateUserProvider(data) {
        return Promise.resolve(this.putUserProvider(data));
    },

    updateProvider(data) {
        return Promise.resolve(this.putProvider(data));
    },

    deleteProvider(guid) {
        return Promise.resolve(this.softDeleteProvider(guid));
    }

};

