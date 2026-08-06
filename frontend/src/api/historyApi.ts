import { client } from "./client";
import type { ChatMessage, DashboardStats, HistoryListResponse } from "../types/history";

export interface HistoryFilters {
  athlete?: string;
  athlete_id?: string;
  uploader?: string;
  sport?: string;
  risk_level?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export async function apiListHistory(filters: HistoryFilters = {}): Promise<HistoryListResponse> {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""));
  const { data } = await client.get<HistoryListResponse>("/api/v1/history", { params });
  return data;
}

export async function apiDeleteHistoryItem(id: string): Promise<void> {
  await client.delete(`/api/v1/history/${id}`);
}

export async function apiDashboardStats(): Promise<DashboardStats> {
  const { data } = await client.get<DashboardStats>("/api/v1/history/dashboard/stats");
  return data;
}

export async function apiListChatMessages(analysisId: string): Promise<ChatMessage[]> {
  const { data } = await client.get<ChatMessage[]>(`/api/v1/chat/${analysisId}/messages`);
  return data;
}

export async function apiSendChatMessage(analysisId: string, message: string): Promise<ChatMessage> {
  const { data } = await client.post<ChatMessage>(`/api/v1/chat/${analysisId}/messages`, { message });
  return data;
}
