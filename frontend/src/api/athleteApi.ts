import { client } from "./client";
import type { Athlete } from "../types/athlete";

export async function apiListAthletes(search?: string): Promise<Athlete[]> {
  const { data } = await client.get<Athlete[]>("/api/v1/athletes", {
    params: search ? { search } : undefined,
  });
  return data;
}

export async function apiCreateAthlete(payload: Record<string, unknown>): Promise<Athlete> {
  const { data } = await client.post<Athlete>("/api/v1/athletes", payload);
  return data;
}

export async function apiUpdateAthlete(id: string, payload: Record<string, unknown>): Promise<Athlete> {
  const { data } = await client.patch<Athlete>(`/api/v1/athletes/${id}`, payload);
  return data;
}

export async function apiDeleteAthlete(id: string): Promise<void> {
  await client.delete(`/api/v1/athletes/${id}`);
}
