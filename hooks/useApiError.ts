import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Terjadi kesalahan'): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
