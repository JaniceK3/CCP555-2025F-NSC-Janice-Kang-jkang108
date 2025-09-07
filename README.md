# fragments API

A Node.js + Express back-end API project with structured logging (Pino), linting (ESLint), and formatting (Prettier).

## Development Scripts

### Lint

Check code for problems using ESLint
npm run lint

### Test

Currently a placeholder script

```bash
npm test
```

### Start

Run the server (no auto-restart)
Server starts on: http://localhost:8080

```bash
npm start
```

### Dev

Run the server in watch mode. Restarts automatically when code changes.
Loads environment variables from debug.env.

```bash
npm run dev
```

### Debug

Run the server in watch mode with debugger enabled on port 9229.

```bash
npm run debug
```

## Notes

- Always run lint before committing
- Don't use git add .
