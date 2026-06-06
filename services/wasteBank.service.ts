import api from './api';

export interface WasteBank {
  id: string;
  name: string;
  address: string;
  city: string;
  openHours: string;
  latitude: number;
  longitude: number;
}

const WasteBankService = {
  async getAll(): Promise<WasteBank[]> {
    const res = await api.get('/waste-banks');
    return res.data.data as WasteBank[];
  },
};

export default WasteBankService;
