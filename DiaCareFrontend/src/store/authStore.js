// Persist access token and user in localStorage so auth survives page refresh.
// Refresh token lives in httpOnly cookie (set by backend, not accessible to JS).

const TOKEN_KEY = "diacare_access_token";
const USER_KEY = "diacare_user";

let accessToken = localStorage.getItem(TOKEN_KEY);
let currentUser = null;
try {
  const raw = localStorage.getItem(USER_KEY);
  if (raw) currentUser = JSON.parse(raw);
} catch {
  /* ignore corrupt storage */
}

export const authStore = {
  getToken: () => accessToken,
  setToken: (token) => {
    accessToken = token;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },
  clearToken: () => {
    accessToken = null;
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser: () => currentUser,
  setUser: (user) => {
    currentUser = user;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  },
  clearUser: () => {
    currentUser = null;
    localStorage.removeItem(USER_KEY);
  },

  getRole: () => currentUser?.role ?? null,

  // Returns the home route based on role
  getHomePath: () => {
    const role = currentUser?.role;
    if (role === "DOCTOR") return "/doctor/dashboard";
    if (role === "PATIENT") return "/patient/dashboard";
    if (role === "ADMIN") return "/dashboard";
    return "/login";
  },

  clear: () => {
    accessToken = null;
    currentUser = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated: () => !!accessToken && !!currentUser,
};
