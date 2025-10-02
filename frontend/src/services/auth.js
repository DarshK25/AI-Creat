import api from '../config/api'

export const auth = {
    login: async(username, password) => {
        const res = await api.post('/api/v1/auth/login', {
            username,
            password
        })
        return res.data;
    },
    logout: async()=>{
        const token = localStorage.getItem('token');
        if(token){
            await api.post('/api/v1/auth/logout', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
        localStorage.removeItem('token');
    }
}