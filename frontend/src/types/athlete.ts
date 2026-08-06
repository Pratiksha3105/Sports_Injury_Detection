// Mirrors app/api/athlete_schemas.py on the backend, field for field.

export interface Athlete {
  id: string;
  managed_by_id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  sport: string | null;
  position: string | null;
  team: string | null;
  contact_phone: string | null;
  email: string | null;
  injury_history: string | null;
  medical_notes: string | null;
  recovery_status: string | null;
  treatment_plan: string | null;
  created_at: string;
  updated_at: string;
}

export type AthleteFormValues = {
  full_name: string;
  age: string;
  gender: string;
  height_cm: string;
  weight_kg: string;
  sport: string;
  position: string;
  team: string;
  contact_phone: string;
  email: string;
  injury_history: string;
  medical_notes: string;
  recovery_status: string;
  treatment_plan: string;
};

export const EMPTY_ATHLETE_FORM: AthleteFormValues = {
  full_name: "",
  age: "",
  gender: "",
  height_cm: "",
  weight_kg: "",
  sport: "",
  position: "",
  team: "",
  contact_phone: "",
  email: "",
  injury_history: "",
  medical_notes: "",
  recovery_status: "",
  treatment_plan: "",
};

export function athleteToFormValues(a: Athlete): AthleteFormValues {
  return {
    full_name: a.full_name,
    age: a.age?.toString() ?? "",
    gender: a.gender ?? "",
    height_cm: a.height_cm?.toString() ?? "",
    weight_kg: a.weight_kg?.toString() ?? "",
    sport: a.sport ?? "",
    position: a.position ?? "",
    team: a.team ?? "",
    contact_phone: a.contact_phone ?? "",
    email: a.email ?? "",
    injury_history: a.injury_history ?? "",
    medical_notes: a.medical_notes ?? "",
    recovery_status: a.recovery_status ?? "",
    treatment_plan: a.treatment_plan ?? "",
  };
}

/** Converts form strings into the JSON payload the API expects (numbers, or
 * null for cleared fields). */
export function formValuesToPayload(f: AthleteFormValues) {
  const num = (s: string) => (s.trim() === "" ? null : Number(s));
  const str = (s: string) => (s.trim() === "" ? null : s.trim());
  return {
    full_name: f.full_name.trim(),
    age: num(f.age),
    gender: str(f.gender),
    height_cm: num(f.height_cm),
    weight_kg: num(f.weight_kg),
    sport: str(f.sport),
    position: str(f.position),
    team: str(f.team),
    contact_phone: str(f.contact_phone),
    email: str(f.email),
    injury_history: str(f.injury_history),
    medical_notes: str(f.medical_notes),
    recovery_status: str(f.recovery_status),
    treatment_plan: str(f.treatment_plan),
  };
}
