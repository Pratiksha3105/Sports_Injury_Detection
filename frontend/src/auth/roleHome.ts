import type { Role } from "./types";

export function roleHome(role: Role): string {
  switch (role) {
    case "admin":
      return "/admin/users";
    case "coach":
      return "/coach";
    case "athlete":
      return "/athlete";
    case "physiotherapist":
      return "/physio";
    default:
      return "/dashboard";
  }
}
