import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authStore } from "../store/authStore";

export default function RequireAuth({ children, allowedRoles = [] }) {
  const navigate = useNavigate();
  const isAuth = authStore.isAuthenticated();
  const role = authStore.getRole();

  useEffect(() => {
    if (!isAuth) {
      navigate("/login", { replace: true });
    } else if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      navigate(authStore.getHomePath(), { replace: true });
    }
  }, [isAuth, role, navigate, allowedRoles]);

  if (!isAuth) return null;
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) return null;
  return children;
}
