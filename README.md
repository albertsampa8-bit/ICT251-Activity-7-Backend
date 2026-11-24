# IT Support Desk API (ICT251 Activity 7)

Node.js + Express + PostgreSQL. CommonJS (no "type": "module").

## Run locally
1. `npm install express cors dotenv pg`   (use `npm.cmd` in PowerShell if npm.ps1 is blocked)
2. Copy `.env.example` to `.env` and paste your database URL.
3. `npm start`, then open http://localhost:3000
4. In a second terminal: `npm run smoke` (or `node scripts/smoke-test.js http://localhost:3000`)