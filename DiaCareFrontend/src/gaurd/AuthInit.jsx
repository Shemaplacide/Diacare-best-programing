import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authStore } from "../store/authStore";
import { getMe } from "../api/auth";

export default function AuthInit({ children }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = authStore.getToken();
    const user = authStore.getUser();

    if (token && !user) {
      getMe()
        .then(({ data }) => {
          authStore.setUser({
            name: data.name,
            email: data.email,
            role: data.role,
          });
          setReady(true);
        })
        .catch(() => {
          authStore.clear();
          if (!window.location.pathname.includes("/login")) {
            navigate("/login");
          }
          setReady(true);
        });
    } else {
      const id = setTimeout(() => setReady(true), 0);
      return () => clearTimeout(id);
    }
  }, [navigate]);

  if (!ready) return null;
  return children;
}
