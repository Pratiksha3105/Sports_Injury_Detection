export type Role = "admin" | "coach" | "athlete" | "physiotherapist";

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  profile_image: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  coach: "Coach",
  athlete: "Athlete",
  physiotherapist: "Physiotherapist",
};

export const SELF_REGISTERABLE_ROLES: Role[] = ["athlete", "coach", "physiotherapist"];
