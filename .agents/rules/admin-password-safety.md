# Admin Password Safety Rules

During all development, testing, migrations, E2E checks, builds, seed operations, feature work, and debugging:

**DO NOT change the admin password unless explicitly instructed by the user to reset it.**

- **Admin Account:** `admin@bridgeofcompassion.org`
- **Password Source of Truth:** `ADMIN_INITIAL_PASSWORD` in `.env.local`

## Permanent Safety Rules:
1. **Never invent a temporary admin password.**
2. **Never generate a replacement password automatically.**
3. **Never overwrite the stored bcrypt hash during unrelated feature work.**
4. **Never rerun password-seeding logic merely to test authentication.**
5. **Never create duplicate test admin accounts.**
6. **Never expose `ADMIN_INITIAL_PASSWORD` in logs, reports, terminal output, commits, screenshots, or code.**
7. **Never print the stored bcrypt hash.**
8. **If authentication testing is required, use the existing admin user and current stored credentials.**
9. **If bcrypt verification fails, diagnose first and STOP.**
10. **Only reset the password after explicit user approval.**
11. **Any seed script must preserve an existing admin password unless the operation is explicitly a password-reset operation.**
12. **Migrations must never modify user passwords.**
13. **Feature E2E tests must not alter admin credentials.**
14. **Before finishing any feature, confirm that authentication changes did not alter the admin password.**
15. **Keep `.env.local` ignored and never stage or commit it.**
