# Node + Express + MongoDB Starter

Tech stack:
- Node.js (ES modules)
- Express
- MongoDB (Mongoose)
- Joi (validation)
- Winston (logging)
- Swagger (swagger-jsdoc + swagger-ui-express)

## Setup

1. Install deps:
   - `npm install`
2. Create env file:
   - `Copy-Item .env.example .env`
3. Start dev server:
   - `npm run dev`

## Useful URLs

- Health: `GET /health`
- Swagger UI: `GET /api-docs`
- Auth:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`

