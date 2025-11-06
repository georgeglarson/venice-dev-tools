# Calendar Versioning Policy

Venice.ai evolves rapidly. The SDK mirrors that cadence with a calendar versioning scheme (`YYYY.MM.D`) so developers know exactly which API behaviour each release targets.

---

## Format

- **Year (YYYY)** – four digits (e.g., 2025)
- **Month (MM)** – no leading zero requirement; we publish as decimal values (e.g., `11` for November)
- **Day (D)** – the day of the month the SDK was validated against Venice’s public API
- Optional **suffix** – `-N` for hotfix increments (`2025.11.5-1`, `2025.11.5-2`, ...)

This format remains semver compliant while encoding the Venice API snapshot date.

---

## Support window

- The **current** calendar release receives active fixes.
- The **previous** calendar release stays in “maintenance” mode for regression patches.
- Older drops move into `docs/archive/` with read-only status.

Refer to `venice-ai-sdk/CHANGELOG.md` for release notes and explicit API highlights.

---

## Upgrading checklist

1. Review Venice.ai’s published changelog for the target date.
2. Pull the latest SDK tag (for example `git checkout v2025.11.5`).
3. Re-run your integration tests against the new calendar release.
4. Update your application’s documentation so your users know which Venice snapshot you support.

If Venice introduces breaking changes mid-cycle, we will publish a hotfix suffixed release with migration notes.

---

## Publishing a new calendar release

Inside the monorepo:

```bash
# 1. Update every package.json
pnpm exec changeset version --snapshot YYYY.MM.D

# 2. Refresh changelog
pnpm exec your-changelog-script  # or edit venice-ai-sdk/CHANGELOG.md manually

# 3. Run tests
pnpm -r test
pnpm -C venice-ai-sdk/packages/core test:integration -- --runInBand

# 4. Tag and publish
git commit -am "chore: release vYYYY.MM.D"
git tag vYYYY.MM.D
pnpm -r publish --filter ./packages/*
```

(Substitute with your release automation of choice if you use Changesets or semantic-release.)

---

## FAQ

**Why not pure semver?**  
Venice’s public API often introduces capability shifts without bumping a version number. Calendar versioning makes it obvious which API cut an SDK version tracks.

**Can I stay on an old calendar release?**  
Yes, but expect the Venice API to drift. Check `docs/archive/` to see what changed since your pinned version.

**How do I reference the release in marketing copy?**  
Use “Venice Dev Tools v2025.11.5” or “November 5th 2025 snapshot” so readers immediately understand the API alignment.

**What if Venice rolls back a change?**  
We issue a hotfix (e.g., `2025.11.5-1`) documenting the adjustment and update the changelog. Follow the changelog RSS feed or GitHub releases to stay notified.

---

Questions? Open an issue or start a discussion in the repository so we can keep the calendar cadence transparent.
