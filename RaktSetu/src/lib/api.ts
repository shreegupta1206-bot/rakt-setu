const API_URL = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL ?? "http://localhost:8000";

export type AppRole = "hospital" | "blood_bank" | "donor";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export const bloodGroups: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export interface AuthUser {
  userId: string;
  role: AppRole;
  email: string;
  token: string;
}

export interface BloodBankProfile {
  user_id: string;
  bank_name: string;
  address: string | null;
  phone: string | null;
  city: string | null;
}

export interface HospitalProfile {
  user_id: string;
  hospital_name: string;
  address: string | null;
  phone: string | null;
  city: string | null;
}

export interface DonorProfile {
  user_id: string;
  full_name: string;
  blood_group: string | null;
  city: string | null;
  phone: string | null;
}

export interface InventoryItem {
  id: string;
  blood_bank_id: string;
  blood_group: string;
  units: number;
}

export interface BloodRequest {
  id: string;
  hospital_id: string;
  blood_group: string;
  units: number;
  urgency: "critical" | "urgent" | "routine";
  status: "pending" | "committed" | "in_transit" | "delivered" | "cancelled";
  notes: string | null;
  acknowledged_at: string | null;
  committed_by: string | null;
  created_at: string;
  updatedAt: string;
}

export interface DonationAppointment {
  id: string;
  donor_id: string;
  drive_name: string;
  location: string;
  appointment_date: string;
  status: "scheduled" | "completed" | "cancelled";
}

const TOKEN_KEY = "hemolink_token";
const USER_KEY = "hemolink_user";

export function saveSession(user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, user.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getSession(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  const tok = localStorage.getItem(TOKEN_KEY);
  if (!raw || !tok) return null;
  try {
    return { ...JSON.parse(raw), token: tok } as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  tok?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (tok) headers["Authorization"] = `Bearer ${tok}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Request failed");
  return data as T;
}

function token(): string {
  const t = localStorage.getItem(TOKEN_KEY);
  if (!t) throw new Error("Not authenticated");
  return t;
}

export async function login(
  email: string,
  password: string,
  role: AppRole
): Promise<AuthUser> {
  const data = await request<{ token: string; userId: string; role: AppRole }>(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify({ email, password, role }) }
  );
  const user: AuthUser = { ...data, email, token: data.token };
  saveSession(user);
  return user;
}

export async function register(
  email: string,
  password: string,
  role: AppRole,
  profile: { name: string; address?: string; phone?: string; bloodGroup?: string; city?: string }
): Promise<AuthUser> {
  const data = await request<{ token: string; userId: string; role: AppRole }>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        role,
        name: profile.name,
        address: profile.address,
        phone: profile.phone,
        blood_group: profile.bloodGroup,
        city: profile.city,
      }),
    }
  );
  const user: AuthUser = { ...data, email, token: data.token };
  saveSession(user);
  return user;
}

export function logout(): void {
  clearSession();
}

export async function getBloodBankProfile(): Promise<BloodBankProfile> {
  return request("/api/blood-bank/profile", {}, token());
}

export async function getHospitalProfile(): Promise<HospitalProfile> {
  return request("/api/hospital/profile", {}, token());
}

export async function getDonorProfile(): Promise<DonorProfile> {
  return request("/api/donor/profile", {}, token());
}

export async function getInventory(): Promise<InventoryItem[]> {
  return request("/api/inventory", {}, token());
}

export async function updateInventoryItem(id: string, units: number): Promise<InventoryItem> {
  return request(`/api/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify({ units }),
  }, token());
}

export async function getAllBloodRequests(): Promise<BloodRequest[]> {
  return request("/api/blood-requests", {}, token());
}

export async function getHospitalRequests(): Promise<BloodRequest[]> {
  return request("/api/blood-requests", {}, token());
}

export async function createBloodRequest(data: {
  blood_group: string;
  units: number;
  urgency: string;
  notes?: string;
}): Promise<BloodRequest> {
  return request("/api/blood-requests", {
    method: "POST",
    body: JSON.stringify(data),
  }, token());
}

export async function updateBloodRequest(
  id: string,
  data: Partial<{ status: string; acknowledged_at: string; committed_by: string }>
): Promise<BloodRequest> {
  return request(`/api/blood-requests/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }, token());
}

export async function getAppointments(): Promise<DonationAppointment[]> {
  return request("/api/appointments", {}, token());
}

export async function createAppointment(data: {
  drive_name: string;
  location: string;
  appointment_date: string;
}): Promise<DonationAppointment> {
  return request("/api/appointments", {
    method: "POST",
    body: JSON.stringify(data),
  }, token());
}
