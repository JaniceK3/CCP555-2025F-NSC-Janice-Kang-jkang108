# fragments API

A Node.js + Express back-end API project with structured logging (Pino), linting (ESLint), and formatting (Prettier).

## Development Scripts

### Lint

Check code for problems using ESLint
npm run lint

### Test

Currently a placeholder script
npm test

### Start

Run the server (no auto-restart)
Server starts on: http://localhost:8080
npm start

### Dev

Run the server in watch mode. Restarts automatically when code changes.
Loads environment variables from debug.env.
npm run dev

### Debug

Run the server in watch mode with debugger enabled on port 9229.
npm run debug

## Notes

- Always run lint before committing
- Don't use git add .
- debug.env is for local use- don't commit secrets
