const AUTH_URL = "https://functions.poehali.dev/96e44448-2627-4b77-8881-330c61a8298d";
const SPECIALISTS_URL = "https://functions.poehali.dev/3ee2e91f-dc8f-4bfb-a34c-41f506876d1a";
const APPOINTMENTS_URL = "https://functions.poehali.dev/f58ffb3c-073d-4c69-905d-9a512cbbbf8f";

export function getToken() {
  return localStorage.getItem("med_token") || "";
}
export function setToken(t: string) {
  localStorage.setItem("med_token", t);
}
export function clearToken() {
  localStorage.removeItem("med_token");
  localStorage.removeItem("med_user");
}
export function getUser() {
  const u = localStorage.getItem("med_user");
  return u ? JSON.parse(u) : null;
}
export function setUser(u: object) {
  localStorage.setItem("med_user", JSON.stringify(u));
}

async function post(url: string, data: object) {
  const token = getToken();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { "X-Auth-Token": token } : {}) },
    body: JSON.stringify(data),
  });
  const text = await res.text();
  const json = JSON.parse(text);
  if (!res.ok) throw new Error(json.error || "Ошибка сервера");
  return json;
}

async function get(url: string, params?: Record<string, string>) {
  const token = getToken();
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await fetch(url + qs, {
    headers: { ...(token ? { "X-Auth-Token": token } : {}) },
  });
  const text = await res.text();
  const json = JSON.parse(text);
  if (!res.ok) throw new Error(json.error || "Ошибка сервера");
  return json;
}

export const api = {
  register: (data: { full_name: string; email: string; phone: string; password: string; role: string }) =>
    post(AUTH_URL, { action: "register", ...data }),

  login: (email: string, password: string) =>
    post(AUTH_URL, { action: "login", email, password }),

  me: () => get(AUTH_URL),

  getSpecialists: () => get(SPECIALISTS_URL),

  getSlots: (specialist_id: number, date: string) =>
    get(SPECIALISTS_URL, { action: "slots", specialist_id: String(specialist_id), date }),

  bookAppointment: (data: {
    specialist_id: number;
    schedule_id?: number;
    appointment_date: string;
    appointment_time: string;
    patient_name: string;
    patient_phone: string;
    patient_comment?: string;
  }) => post(APPOINTMENTS_URL, data),

  myAppointments: () => get(APPOINTMENTS_URL, { action: "my" }),

  allAppointments: () => get(APPOINTMENTS_URL),
};