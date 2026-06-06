import api from './api';

export interface Voucher {
  id: string;
  name: string;
  description?: string;
  pointCost: number;
  value: number;
  stock: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface VoucherRedemption {
  id: string;
  code: string;
  pointsUsed: number;
  redeemedAt: string;
  expiresAt: string;
  voucher: { name: string; value: number; pointCost: number; description?: string };
}

export interface RedeemResult {
  redemptionId: string;
  voucherName: string;
  pointsUsed: number;
  redeemedAt: string;
  code: string;
  expiresAt: string;
}

const VoucherService = {
  async getAll(): Promise<Voucher[]> {
    const res = await api.get('/vouchers');
    return res.data.data as Voucher[];
  },

  async redeem(voucherId: string): Promise<RedeemResult> {
    const res = await api.post(`/vouchers/${voucherId}/redeem`);
    return res.data.data as RedeemResult;
  },

  async getMyRedemptions(): Promise<VoucherRedemption[]> {
    const res = await api.get('/vouchers/my-redemptions');
    return res.data.data as VoucherRedemption[];
  },
};

export default VoucherService;
