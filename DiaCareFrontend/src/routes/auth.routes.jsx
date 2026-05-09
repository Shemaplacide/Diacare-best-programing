import { Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/Register";

export default function AuthRoutes() {
  return (
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </>
  );
}
