# EVMS_BE

Tech stack: Node.js, Express, TypeScript.

Scripts:
- dev: nodemon src/index.ts
- build: tsc -p tsconfig.json
- start: node dist/index.js

Quick start:
1. Copy .env.example to .env and adjust PORT if needed
2. npm run dev

Endpoints:
- GET / -> plain text
- GET /api/health -> { status: "ok" }
