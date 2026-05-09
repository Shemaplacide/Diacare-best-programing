<<<<<<< HEAD
# DiaCare Frontend

This is the React frontend for DiaCare. It is built with Vite and is ready to be deployed on Vercel as a static site.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

## Environment Variables

Create a local `.env` file from `.env.example`.

Required for Vercel and local development:

- `VITE_API_URL`: the full backend API base URL, for example `https://your-backend-domain.com/api/v1`

Optional placeholders are included for OAuth-related values used by the app.

## Vercel Deployment

Deploy this frontend as the Vercel project root directory:

- Root directory: `DiaCareFrontend`
- Build command: `npm run build`
- Output directory: `dist`

The included [`vercel.json`](./vercel.json) keeps React Router routes working on page refresh by rewriting all app routes to `index.html`.

Important:

- Vercel should host the frontend only.
- The Spring Boot backend in `../DiaCare` must be deployed separately and its public URL should be placed in `VITE_API_URL`.
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
