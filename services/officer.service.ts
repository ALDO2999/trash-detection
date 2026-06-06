import api from './api';
import { WasteType } from './scan.service';

export type SubmissionStatus = 'MENUNGGU_VERIFIKASI' | 'DISETUJUI' | 'DITOLAK';

export interface OfficerSubmission {
  id: string;
  wasteType: WasteType;
  estimatedWeight?: number;
  actualWeight?: number;
  status: SubmissionStatus;
  notes?: string;
  imageUrl: string;
  createdAt: string;
  user: { id: string; name: string; email: string; phone?: string };
  scanResult?: { predictedType: WasteType; confidence: number; imageUrl?: string };
}

export interface OfficerDashboard {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalWeightKg: number;
  totalPointsGiven: number;
  totalActiveUsers: number;
}

const OfficerService = {
  async getDashboard(): Promise<OfficerDashboard> {
    const res = await api.get('/officer/dashboard');
    return res.data.data as OfficerDashboard;
  },

  async getSubmissions(status?: SubmissionStatus): Promise<OfficerSubmission[]> {
    const res = await api.get('/officer/submissions', {
      params: status ? { status } : {},
    });
    return res.data.data as OfficerSubmission[];
  },

  async getSubmissionDetail(submissionId: string): Promise<OfficerSubmission> {
    const res = await api.get(`/officer/submissions/${submissionId}`);
    return res.data.data as OfficerSubmission;
  },

  async verifySubmission(
    submissionId: string,
    action: 'APPROVE' | 'REJECT',
    actualWeight?: number,
    notes?: string,
  ) {
    const res = await api.patch(`/officer/submissions/${submissionId}/verify`, {
      action,
      ...(actualWeight !== undefined && { actualWeight }),
      ...(notes && { notes }),
    });
    return res.data;
  },
};

export default OfficerService;
