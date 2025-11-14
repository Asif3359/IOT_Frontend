import axios from 'axios';

export interface GuidanceInfo {
  description?: string;
  severity?: string;
  remedies?: string[];
  follow_up?: string;
  source?: string;
  model?: string;
}

export interface IndividualPrediction {
  disease: string;
  confidence: number;
  model_used?: string;
}

export interface DiseasePrediction {
  disease: string;
  confidence: number;
  model_used?: string;
  guidance?: GuidanceInfo | null;
  individual_predictions?: IndividualPrediction[] | null;
}

export interface CaptureResponse {
  success: boolean;
  filename: string;
  path: string;
  url: string;
  size: number;
  timestamp: string;
  disease_prediction?: DiseasePrediction;
  top_predictions?: Array<{
    disease: string;
    confidence: number;
  }>;
}

export interface PredictionResponse {
  success: boolean;
  filename: string;
  prediction: DiseasePrediction;
  top_predictions: Array<{
    disease: string;
    confidence: number;
    info: any;
  }>;
}

export interface ImageInfo {
  filename: string;
  path: string;
  size: number;
  created: string;
}

class CameraAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setBaseURL(url: string) {
    this.baseURL = url;
  }

  /**
   * Capture image with automatic disease prediction
   */
  async capture(): Promise<CaptureResponse> {
    try {
      console.log('🔗 Calling:', `${this.baseURL}/capture`);
      const response = await axios.post<CaptureResponse>(
        `${this.baseURL}/capture`,
        {},
        { timeout: 15000 }
      );
      console.log('✅ Response received:', response.status);
      return response.data;
    } catch (error: any) {
      console.error('❌ Capture error details:');
      console.error('  - URL:', `${this.baseURL}/capture`);
      console.error('  - Status:', error.response?.status);
      console.error('  - Message:', error.message);
      console.error('  - Data:', error.response?.data);
      throw error;
    }
  }

  /**
   * Predict disease from saved image
   */
  async predict(filename: string): Promise<PredictionResponse> {
    try {
      const response = await axios.post<PredictionResponse>(
        `${this.baseURL}/predict/${filename}`,
        {},
        { timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  }

  /**
   * Get list of saved images
   */
  async listImages(): Promise<ImageInfo[]> {
    try {
      const response = await axios.get<{ images: ImageInfo[] }>(
        `${this.baseURL}/images`
      );
      return response.data.images;
    } catch (error) {
      console.error('List images error:', error);
      throw error;
    }
  }

  /**
   * Delete an image
   */
  async deleteImage(filename: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/images/${filename}`);
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  /**
   * Get system status
   */
  async getStatus(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/status`);
      return response.data;
    } catch (error) {
      console.error('Status error:', error);
      throw error;
    }
  }
}

export const cameraApi = new CameraAPI('http://192.168.0.115:3000');
export default cameraApi;

