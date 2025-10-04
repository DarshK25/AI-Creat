import api from '../config/api';
import type {
  ProvidersResponse,
  FormatsResponse,
  GenerationRequest,
  GenerationJob,
  JobResults,
  GeneratedAsset,
  DownloadRequest,
  DownloadResponse,
} from '../types';

const BASE_URL = '/api/v1';

export const generation = {
  getProviders: async (): Promise<ProvidersResponse> => {
    try {
      const response = await api.get(`${BASE_URL}/providers`);
      return response.data;
    } catch (error) {
      console.error('Failed to get providers:', error);
      // Return fallback data
      return { providers: ['gemini'], default_provider: 'gemini' };
    }
  },

  getFormats: async (): Promise<FormatsResponse> => {
    try {
      const response = await api.get(`${BASE_URL}/formats`);
      return response.data;
    } catch (error) {
      console.error('Failed to get formats:', error);
      // Return fallback data with common formats
      return {
        resizing: [
          {
            id: 'instagram-post',
            name: 'Instagram Post',
            platform_id: 'instagram',
            platform_name: 'Instagram',
            width: 1080,
            height: 1080,
            description: 'Square format for Instagram posts'
          },
          {
            id: 'instagram-story',
            name: 'Instagram Story',
            platform_id: 'instagram',
            platform_name: 'Instagram',
            width: 1080,
            height: 1920,
            description: 'Vertical format for Instagram stories'
          },
          {
            id: 'facebook-post',
            name: 'Facebook Post',
            platform_id: 'facebook',
            platform_name: 'Facebook',
            width: 1200,
            height: 630,
            description: 'Landscape format for Facebook posts'
          }
        ],
        repurposing: []
      };
    }
  },

  startGeneration: async (generationRequest: GenerationRequest): Promise<GenerationJob> => {
    const response = await api.post(`${BASE_URL}/generate`, generationRequest);
    return response.data;
  },

  getJobStatus: async (jobId: string): Promise<{ status: string; progress: number }> => {
    const response = await api.get(`${BASE_URL}/generate/${jobId}/status`);
    return response.data;
  },

  getJobResults: async (jobId: string): Promise<JobResults> => {
    const response = await api.get(`${BASE_URL}/generate/${jobId}/results`);
    return response.data;
  },

  getGeneratedAsset: async (assetId: string): Promise<GeneratedAsset> => {
    const response = await api.get(`${BASE_URL}/generated-assets/${assetId}`);
    return response.data;
  },

  getDownloadUrl: async (downloadRequest: DownloadRequest): Promise<DownloadResponse> => {
    const response = await api.post(`${BASE_URL}/download`, downloadRequest);
    return response.data;
  },

  applyManualEdits: async (assetId: string, edits: any): Promise<GeneratedAsset> => {
    const response = await api.put(`${BASE_URL}/generation/generated-assets/${assetId}`, {
      edits: edits,
    });
    return response.data;
  },

  downloadAssets: async (downloadData: {
    assetIds: string[];
    format: string;
    quality: string;
    downloadType: string;
  }): Promise<{ downloadUrl: string }> => {
    const response = await api.post(`${BASE_URL}/download/batch`, downloadData);
    return response.data;
  },
};