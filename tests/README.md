# Smoke tests

## Staging smoke tests

These tests use deterministic fixture data and never contact MyPack:

```bash
npm run test:smoke
```

They run against desktop and mobile Chrome. Use
`npm run test:smoke:headed` when debugging locally.

## Authenticated extension smoke test

The authenticated test builds the unpacked extension and opens a dedicated,
git-ignored Chrome profile:

```bash
npm run test:smoke:auth
```

Complete OAuth/MFA when Chrome asks, then navigate to the MyPack planner page.
The session is reused from `.auth/mypack-smoke-profile` until it expires.

The live test is intentionally read-only: it verifies extension injection,
opens and closes the planner, switches tabs, and toggles the theme. It never
adds a course to the cart or submits enrollment.

Optional environment variables:

- `MYPACK_PORTAL_URL`: initial supported MyPack URL to open.
- `MYPACK_AUTH_PROFILE`: alternate persistent Chrome profile directory.
- `MYPACK_AUTH_WAIT_MS`: login wait in milliseconds; defaults to five minutes.

Never commit `.auth`, browser profiles, cookies, OAuth tokens, screenshots
containing student data, or captured authenticated network traffic.
