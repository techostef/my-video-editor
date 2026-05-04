import axios from 'axios';
import type { UploadResponse } from '../types';

// Android emulator: use 10.0.2.2 instead of localhost
// Physical device: use your machine's local IP, e.g. http://192.168.1.x:3000
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.11:3000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000,
});

export async function uploadVideo(
  videoUri: string,
  startTime?: number,
  endTime?: number
): Promise<UploadResponse> {
  const formData = new FormData();

  // React Native requires { uri, name, type } — NOT a Blob
  formData.append('video', {
    uri: videoUri,
    name: 'video.mp4',
    type: 'video/mp4',
  } as unknown as Blob);

  if (startTime !== undefined) formData.append('startTime', String(startTime));
  if (endTime !== undefined) formData.append('endTime', String(endTime));

  const { data } = await api.post<UploadResponse>('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function renderVideo(filePath: string, srt: string): Promise<string> {
  const { data } = await api.post<{ videoUrl: string }>('/api/render', { filePath, srt });
  return `${BASE_URL}${data.videoUrl}`;
}

export async function checkHealth(): Promise<boolean> {
  try {
    await axios.get(`${BASE_URL}/api/check`, { timeout: 5_000 });
    return true;
  } catch {
    return false;
  }
}
