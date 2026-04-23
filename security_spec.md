# Security Specification for Adilson Portfolio CMS

## 1. Data Invariants
- Only authenticated admins can write to any collection.
- Readers don't need authentication to view the portfolio data (public read).
- `perfil/principal` and `configuracoes/global` are single-document collections (singleton).
- IDs must be alphanumeric and safe.
- Timestamps must be server-generated on creation/update.

## 2. The Dirty Dozen Payloads
1. Attempting to update `perfil/principal` without being logged in.
2. Attempting to create a project with a 2MB metadata string.
3. Attempting to delete a service as a guest.
4. Attempting to spoof `ownerId` (not applicable here as only admins write, but we will block all non-admins).
5. Attempting to change `isAdmin` flag in a user document (we don't have user docs, we use a dedicated `admins` collection).
6. Attempting to inject script tags into `tagline`.
7. Attempting to bypass `ordem` validation by sending a string instead of a number.
8. Attempting to write to a collection not defined in the blueprint (e.g., `hack_collection`).
9. Attempting to set an extremely high `ordem` to overflow.
10. Attempting to update an immutable field (if any were defined, like `id`).
11. Attempting to read PII from a private collection (not applicable here, all data is public for display).
12. Attempting to list all users (we will block read access to any user list).

## 3. Test Runner (Mock)
A real test runner `firestore.rules.test.ts` would verify these.
For now, I will proceed to generate the hardened rules.
