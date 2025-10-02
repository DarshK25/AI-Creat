import api from '../config/api'

const BASE_URL = "/api/v1/projects"

export const dashboard = {
    getUserProfile: async () => {
        const res = await api.get('/api/v1/users/me');
        return res.data;
    },
    getProjects: async (limit = 10, offset = 0) => {
        const res = await api.get(`${BASE_URL}?limit=${limit}&offset=${offset}`);
        return res.data;
    },
    getProjectStatus: async (pId) => {
        const res = await api.get(`${BASE_URL}/${pId}/status`);
        return res.data;
    },
    getProjectPreview: async (projectId) => {
        const res = await api.get(`${BASE_URL}/${projectId}/preview`);
        return res.data;
    },
    
    updatePreferences: async (preferences) => {
        const response = await api.put('/api/v1/users/me/preferences', preferences);
        return response.data;
    },
    uploadProject: async (projectName, files) => {
        const formData = new FormData();
        formData.append('projectName', projectName);
        files.forEach(file => {
          formData.append('files', file);
        });
        const res = await api.post(`${BASE_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return res.data;
    },
    

    deleteProject: async (projectId) => {
        const res = await api.delete(`${BASE_URL}/${projectId}`);
        return res.data;
    },

    


    getAIProviders: async () => {
        const res = await api.get('/api/v1/generation/providers');
        return res.data;
    },
    startGeneration: async (generationRequest) => {
        const res = await api.post('/api/v1/generation/generate', generationRequest);
        return res.data;
    },

}