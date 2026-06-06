import api from './api';

export type PointTransactionType = 'EARNED' | 'REDEEMED';

export interface PointTransaction {
  id: string;
  amount: number;
  type: PointTransactionType;
  description: string;
  createdAt: string;
  submission?: { wasteType: string; actualWeight: number };
  voucherRedemption?: { voucher: { name: string } };
}

const PointsService = {
  async getBalance(): Promise<number> {
    const res = await api.get('/points/balance');
    return res.data.data.pointBalance as number;
  },

  async getHistory(): Promise<PointTransaction[]> {
    const res = await api.get('/points/history');
    return res.data.data as PointTransaction[];
  },
};

export default PointsService;
