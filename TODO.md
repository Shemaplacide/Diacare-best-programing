# Auth Connection Debug Plan

## Root Causes Found

1. **API URL mismatch**: Frontend axios uses `import.meta.env.VITE_API_URL` but may not have `/api/v1` suffix
2. **Response shape mismatch**: Backend `AuthResponse` returns flat `username` string; frontend expects nested `user` object with `.name`
3. **Missing auth endpoints**: `/auth/me`, `/auth/logout`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password` not implemented
4. **No structured error responses**: `RuntimeException` yields HTML 500 instead of JSON
5. **No refresh token cookies**: Backend doesn't set httpOnly cookies; frontend refresh interceptor will fail

## Steps to Fix

- [x] 1. Fix frontend API base URL with safe fallback in `axios.js`
- [x] 2. Update `AuthResponse` DTO to return nested `user` object matching frontend expectations
- [x] 3. Add missing auth endpoints (`/me`, `/logout`, `/refresh`, `/forgot-password`, `/reset-password`) to `AuthController`
- [x] 4. Create `GlobalExceptionHandler` for structured JSON error responses
- [x] 5. Harden frontend axios interceptor for graceful fallback
- [x] 6. Add `@CrossOrigin` safety net to `AuthController`
- [x] 7. Add `/doctors/all` endpoint (already exists)
- [x] 8. Add `/glucose/all` endpoint to `GlucoseService` + `GlucoseController`
- [x] 9. Add `/prescriptions/all` endpoint to `PrescriptionService` + `PrescriptionController`
- [x] 10. Add `/meal-plans/all` endpoint to `MealPlanService` + `MealPlanController`
- [x] 11. Add `/appointments/all` endpoint to `AppointmentService` + `AppointmentController`
- [x] 12. Compile backend and test login with seeded credentials
- [ ] 13. Add frontend API clients for `/all` endpoints
- [ ] 14. Wire up admin dashboard to real APIs
- [ ] 15. Wire up doctor dashboard to real APIs
