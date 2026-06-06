import api from './api';
import { WasteType } from './scan.service';

export type SubmissionStatus = 'MENUNGGU_VERIFIKASI' | 'DISETUJUI' | 'DITOLAK';

export interface Submission {
  id: string;
  wasteType: WasteType;
  estimatedWeight?: number;
  actualWeight?: number;
  imageUrl: string;
  status: SubmissionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  scanResult?: {
    predictedType: WasteType;
    confidence: number;
  };
  reviewedBy?: { name: string };
}

const SubmissionService = {
  async create(scanResultId: string, wasteType: WasteType, estimatedWeight?: number) {
    const res = await api.post('/submissions', {
      scanResultId,
      wasteType,
      estimatedWeight,
    });
    return res.data.data as Submission;
  },

  async getMySubmissions(): Promise<Submission[]> {
    const res = await api.get('/submissions');
    return res.data.data as Submission[];
  },

  async getDetail(submissionId: string): Promise<Submission> {
    const res = await api.get(`/submissions/${submissionId}`);
    return res.data.data as Submission;
  },
};

export default SubmissionService;
