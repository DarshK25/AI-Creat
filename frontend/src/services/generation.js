import api from '../config/api'

const BASE_URL = '/api/v1'

export const generation = {
    getProviders: async () => {
        const res = await api.get(`${BASE_URL}/providers`);
        return res.data;
    },
    getFormats: async () => {
        const res = await api.get(`${BASE_URL}/formats`);
        return res.data;
    },
    startGeneration: async (generationRequest) => {
        const res = await api.post(`${BASE_URL}/generate`, generationRequest);
        return res.data;
    },
    getJobStatus: async (jobId) => {
        const res = await api.get(`${BASE_URL}/generate/${jobId}/status`);
        return res.data;
    },
    getJobResults: async (jobId) => {
        const res = await api.get(`${BASE_URL}/generate/${jobId}/results`);
        return res.data;
    },
    getGeneratedAsset: async (assetId) => {
        const res = await api.get(`${BASE_URL}/generated-assets/${assetId}`);
        return res.data;
    },
    getDownloadUrl: async (downloadRequest) => {
        const res = await api.post(`${BASE_URL}/download`, downloadRequest);
        return res.data;
    },
    applyManualEdits: async (assetId, edits) => {
        const res = await api.put(`${BASE_URL}/generation/generated-assets/${assetId}`, {
            edits: edits
        });
        return res.data;
    },
}