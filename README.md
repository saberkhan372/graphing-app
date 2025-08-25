# Graphing App

A simple algebra graphing application that parses linear equations and plots them in the browser.

## Running tests

Use the built-in Node test runner:

```bash
npm test
```

## Serving the app

Install dependencies and start the bundled static server (no global install required):

```bash
npm install
npm start
```

The local dev server uses a project-scoped copy of `http-server`, so you don't need to install it globally.

Then open the displayed URL (for example, http://localhost:8080) in your browser.

### Troubleshooting

If you see an `EPERM: operation not permitted, uv_cwd` error, the current working directory is not accessible. Ensure you run commands from a folder you own (e.g. the project root) rather than a protected system directory.
