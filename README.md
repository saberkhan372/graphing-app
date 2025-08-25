# Graphing App

A simple algebra graphing application that parses linear equations and plots them in the browser.

## Running tests

Use the built-in Node test runner:

```bash
npm test
```

## Serving the app

Any static file server will work. If you have `http-server` installed, run:

```bash
npx http-server .
```

Then open the displayed URL in your browser.

## Database schema

The `db/schema.sql` file contains the PostgreSQL schema for user management, course content, progress tracking, and assessment records. Load it into a database with:

```bash
psql -f db/schema.sql
```

Ensure PostgreSQL and the `psql` CLI are installed before running the command.

