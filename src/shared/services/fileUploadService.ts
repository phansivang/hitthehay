import { apiClient } from '@/shared/lib/api-client';
import { getApiBaseUrl } from '@/shared/lib/utils/environment';

/**
 * Response type for file upload
 */
export interface FileUploadResponse {
  data: {
    key: string;
    url: string;
  };
  message: string;
}

/**
 * Response type for file view
 */
export interface FileViewResponse {
  data: {
    url: string;
  };
  message: string;
}

/**
 * Service for file upload operations
 */
export class FileUploadService {
  /**
   * Upload a file
   */
  async uploadFile(file: File): Promise<FileUploadResponse> {
    return apiClient.postFile<FileUploadResponse>('client/files/upload', file);
  }

  /**
   * Get file view URL by key
   * The API endpoint /client/files/view?key=<key> returns the video URL in standard format
   */
  async getFileViewUrl(key: string): Promise<string> {
    try {
      // Backend always returns JSON with {data: {url: string}, message: string}
      const response = await apiClient.get<FileViewResponse>(`client/files/view?key=${encodeURIComponent(key)}`);
      
      return response.data.url;
    } catch (error) {
      console.error('Error fetching file view URL:', error);
    }
    
    // Fallback: construct the view URL directly
    // The API endpoint itself may serve the video or redirect to it
    const baseUrl = getApiBaseUrl();
    const normalizedBase = baseUrl?.replace(/\/$/, '') ?? '';
    const endpoint = `client/files/view?key=${encodeURIComponent(key)}`;
    return normalizedBase ? `${normalizedBase}/${endpoint}` : `/${endpoint}`;
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();

