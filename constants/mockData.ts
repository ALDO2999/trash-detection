export type WasteType = 'Plastic' | 'Paper' | 'Cardboard' | 'Metal' | 'Battery' | 'Clothes' | 'Shoes';

export type SubmissionStatus = 'MENUNGGU_VERIFIKASI' | 'DISETUJUI' | 'DITOLAK';

export type UserRole = 'user' | 'officer';

export interface WasteCategory {
  id: WasteType;
  label: string;
  pointsPerKg: number;
  icon: string;
  color: string;
  bgColor: string;
}

export interface Submission {
  id: string;
  wasteType: WasteType;
  estimatedQty: number;
  estimatedWeight: number;
  actualWeight?: number;
  photoUri: string;
  submittedAt: string;
  status: SubmissionStatus;
  pointsEarned?: number;
  rejectionReason?: string;
  officerNotes?: string;
}

export interface PointTransaction {
  id: string;
  type: 'earned' | 'redeemed';
  points: number;
  description: string;
  date: string;
  submissionId?: string;
}

export interface Voucher {
  id: string;
  title: string;
  merchant: string;
  pointsRequired: number;
  value: number;
  expiresAt: string;
}

export interface MockUser {
  id: string;
  name: string;
  username: string;
  email: string;
  city: string;
  role: UserRole;
  points: number;
  level: string;
  levelProgress: number;
  rank: number;
  streakDays: number;
  totalWeightKg: number;
  totalSubmissions: number;
  avatarInitials: string;
}

// ─── Waste Categories ───────────────────────────────────────────────────────

export const WASTE_CATEGORIES: WasteCategory[] = [
  { id: 'Plastic',   label: 'Plastic',   pointsPerKg: 10, icon: 'water-drop',   color: '#2196F3', bgColor: '#E3F2FD' },
  { id: 'Paper',     label: 'Paper',     pointsPerKg: 5,  icon: 'description',  color: '#FF9800', bgColor: '#FFF3E0' },
  { id: 'Cardboard', label: 'Cardboard', pointsPerKg: 8,  icon: 'inventory-2',  color: '#795548', bgColor: '#EFEBE9' },
  { id: 'Metal',     label: 'Metal',     pointsPerKg: 20, icon: 'hardware',     color: '#607D8B', bgColor: '#ECEFF1' },
  { id: 'Battery',   label: 'Battery',   pointsPerKg: 50, icon: 'battery-full', color: '#F44336', bgColor: '#FFEBEE' },
  { id: 'Clothes',   label: 'Clothes',   pointsPerKg: 15, icon: 'checkroom',    color: '#9C27B0', bgColor: '#F3E5F5' },
  { id: 'Shoes',     label: 'Shoes',     pointsPerKg: 25, icon: 'roller-skating', color: '#FF5722', bgColor: '#FBE9E7' },
];

export function getWasteCategory(type: WasteType): WasteCategory {
  return WASTE_CATEGORIES.find((c) => c.id === type)!;
}

export function calcPoints(type: WasteType, weightKg: number): number {
  return Math.round(getWasteCategory(type).pointsPerKg * weightKg);
}

// ─── Mock User ───────────────────────────────────────────────────────────────

export const MOCK_USER: MockUser = {
  id: 'u001',
  name: 'Alex Pratama',
  username: 'alexpratama',
  email: 'alex@email.com',
  city: 'Jakarta',
  role: 'user',
  points: 2450,
  level: 'Eco Warrior',
  levelProgress: 0.8,
  rank: 5,
  streakDays: 4,
  totalWeightKg: 66,
  totalSubmissions: 18,
  avatarInitials: 'AP',
};

export const MOCK_OFFICER: MockUser = {
  id: 'o001',
  name: 'Budi Santoso',
  username: 'budisantoso',
  email: 'budi@wastesort.com',
  city: 'Jakarta',
  role: 'officer',
  points: 0,
  level: '-',
  levelProgress: 0,
  rank: 0,
  streakDays: 0,
  totalWeightKg: 0,
  totalSubmissions: 0,
  avatarInitials: 'BS',
};

// ─── Mock Submissions ────────────────────────────────────────────────────────

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'WS-001',
    wasteType: 'Plastic',
    estimatedQty: 5,
    estimatedWeight: 2.0,
    actualWeight: 2.1,
    photoUri: '',
    submittedAt: '2026-06-03T09:00:00Z',
    status: 'DISETUJUI',
    pointsEarned: 21,
  },
  {
    id: 'WS-002',
    wasteType: 'Metal',
    estimatedQty: 3,
    estimatedWeight: 1.5,
    photoUri: '',
    submittedAt: '2026-06-04T10:30:00Z',
    status: 'MENUNGGU_VERIFIKASI',
  },
  {
    id: 'WS-003',
    wasteType: 'Paper',
    estimatedQty: 10,
    estimatedWeight: 3.0,
    actualWeight: 2.8,
    photoUri: '',
    submittedAt: '2026-06-02T14:00:00Z',
    status: 'DISETUJUI',
    pointsEarned: 14,
  },
  {
    id: 'WS-004',
    wasteType: 'Battery',
    estimatedQty: 6,
    estimatedWeight: 0.5,
    photoUri: '',
    submittedAt: '2026-06-04T08:00:00Z',
    status: 'MENUNGGU_VERIFIKASI',
  },
  {
    id: 'WS-005',
    wasteType: 'Clothes',
    estimatedQty: 4,
    estimatedWeight: 2.5,
    photoUri: '',
    submittedAt: '2026-06-01T11:00:00Z',
    status: 'DITOLAK',
    rejectionReason: 'Sampah tidak sesuai',
    officerNotes: 'Pakaian masih bercampur dengan sampah rumah tangga.',
  },
];

// ─── Mock Point Transactions ─────────────────────────────────────────────────

export const MOCK_TRANSACTIONS: PointTransaction[] = [
  { id: 't1', type: 'earned',   points: 21,  description: 'Plastic 2.1kg',      date: '2026-06-03', submissionId: 'WS-001' },
  { id: 't2', type: 'earned',   points: 14,  description: 'Paper 2.8kg',         date: '2026-06-02', submissionId: 'WS-003' },
  { id: 't3', type: 'redeemed', points: -100, description: 'Voucher Rp10.000',   date: '2026-05-30' },
  { id: 't4', type: 'earned',   points: 375, description: 'Clothes 2.5kg bonus', date: '2026-05-28', submissionId: 'WS-005' },
  { id: 't5', type: 'redeemed', points: -250, description: 'Voucher Rp25.000',   date: '2026-05-20' },
];

// ─── Mock Vouchers ───────────────────────────────────────────────────────────

export const MOCK_VOUCHERS: Voucher[] = [
  { id: 'v1', title: 'Voucher Rp10.000',  merchant: 'GoPay',        pointsRequired: 100, value: 10000,  expiresAt: '2026-08-31' },
  { id: 'v2', title: 'Voucher Rp25.000',  merchant: 'OVO',          pointsRequired: 250, value: 25000,  expiresAt: '2026-08-31' },
  { id: 'v3', title: 'Voucher Rp50.000',  merchant: 'Dana',         pointsRequired: 500, value: 50000,  expiresAt: '2026-08-31' },
  { id: 'v4', title: 'Diskon 20% Kopi',   merchant: 'Kopi Kenangan', pointsRequired: 150, value: 20000, expiresAt: '2026-07-31' },
];

// ─── Officer Mock Submissions Queue ─────────────────────────────────────────

export const MOCK_OFFICER_QUEUE: Submission[] = [
  {
    id: 'WS-002',
    wasteType: 'Metal',
    estimatedQty: 3,
    estimatedWeight: 1.5,
    photoUri: '',
    submittedAt: '2026-06-04T10:30:00Z',
    status: 'MENUNGGU_VERIFIKASI',
  },
  {
    id: 'WS-004',
    wasteType: 'Battery',
    estimatedQty: 6,
    estimatedWeight: 0.5,
    photoUri: '',
    submittedAt: '2026-06-04T08:00:00Z',
    status: 'MENUNGGU_VERIFIKASI',
  },
  {
    id: 'WS-006',
    wasteType: 'Cardboard',
    estimatedQty: 8,
    estimatedWeight: 4.0,
    photoUri: '',
    submittedAt: '2026-06-04T07:45:00Z',
    status: 'MENUNGGU_VERIFIKASI',
  },
  {
    id: 'WS-007',
    wasteType: 'Shoes',
    estimatedQty: 2,
    estimatedWeight: 1.2,
    photoUri: '',
    submittedAt: '2026-06-04T07:00:00Z',
    status: 'MENUNGGU_VERIFIKASI',
  },
];

// ─── Stats per waste type (user dashboard) ───────────────────────────────────

export const MOCK_WASTE_STATS: { type: WasteType; totalKg: number }[] = [
  { type: 'Plastic',   totalKg: 25 },
  { type: 'Paper',     totalKg: 12 },
  { type: 'Metal',     totalKg: 8  },
  { type: 'Cardboard', totalKg: 10 },
  { type: 'Battery',   totalKg: 2  },
  { type: 'Clothes',   totalKg: 6  },
  { type: 'Shoes',     totalKg: 3  },
];
