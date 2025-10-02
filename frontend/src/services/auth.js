import api from '../config/api'

const BASE_URL = "/api/v1/auth"

export const auth = {
    login: async(username, password) => {
        const res = await api.post(`${BASE_URL}/login`, {
            username,
            password
        })
        return res.data;
    },
    logout: async()=>{
        const token = localStorage.getItem('token');
        if(token){
            await api.post(`${BASE_URL}/logout`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
        localStorage.removeItem('token');
    }
}
