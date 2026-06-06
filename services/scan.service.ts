import api, { BASE_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WasteType = 'PLASTIC' | 'CARDBOARD' | 'METAL' | 'BATTERY' | 'CLOTHES' | 'SHOES';

export interface ScanPrediction {
  label: string;
  confidence: number;
}

export interface ScanResult {
  scanResultId: string;
  imageUrl: string;
  predictedType: WasteType;
  label: string;
  confidence: number;
  allPredictions: ScanPrediction[];
}

const ScanService = {
  async scanImage(imageUri: string, mimeType: string = 'image/jpeg'): Promise<ScanResult> {
    const token = await AsyncStorage.getItem('accessToken');

    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: mimeType,
      name: 'scan.jpg',
    } as any);

    const res = await api.post('/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data as ScanResult;
  },

  async getHistory() {
    const res = await api.get('/scan/history');
    return res.data.data;
  },

  getImageUrl(path?: string | null): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${BASE_URL.replace('/api', '')}${path}`;
  },
};

export default ScanService;
