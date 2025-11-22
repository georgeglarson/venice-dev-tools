# GitHub Release Publishing Instructions

## Release Information

- **Version**: v2025.11.22
- **Tag Name**: `v2025.11.22`
- **Release Title**: `Venice AI SDK v2025.11.22 - 100% Swagger Compliant`
- **Release Type**: Minor Release (Non-breaking)

---

## Step-by-Step Publishing Guide

### 1. Prepare the Repository

```bash
# Ensure all changes are committed
git status

# Commit any remaining changes
git add .
git commit -m "chore: release v2025.11.22"

# Push to main branch
git push origin main
```

### 2. Create Git Tag

```bash
# Create annotated tag
git tag -a v2025.11.22 -m "Release v2025.11.22 - 100% Swagger Compliant"

# Push tag to GitHub
git push origin v2025.11.22
```

### 3. Create GitHub Release

#### Option A: Using GitHub Web Interface

1. Go to: https://github.com/georgeglarson/venice-dev-tools/releases/new

2. **Choose a tag**: Select `v2025.11.22` (or create new tag)

3. **Release title**: 
   ```
   Venice AI SDK v2025.11.22 - 100% Swagger Compliant
   ```

4. **Description**: Copy the entire content from `GITHUB_RELEASE_v2025.11.22.md`

5. **Attach binaries** (optional): None needed for this release

6. **Set as latest release**: ✅ Check this box

7. **Create discussion**: ✅ Recommended - Select "Announcements" category

8. Click **"Publish release"**

#### Option B: Using GitHub CLI

```bash
# Install GitHub CLI if needed
# brew install gh (macOS)
# Or download from: https://cli.github.com

# Authenticate
gh auth login

# Create release
gh release create v2025.11.22 \
  --title "Venice AI SDK v2025.11.22 - 100% Swagger Compliant" \
  --notes-file GITHUB_RELEASE_v2025.11.22.md \
  --latest

# Optionally create discussion
gh release create v2025.11.22 \
  --title "Venice AI SDK v2025.11.22 - 100% Swagger Compliant" \
  --notes-file GITHUB_RELEASE_v2025.11.22.md \
  --discussion-category "Announcements" \
  --latest
```

### 4. Publish to npm

```bash
# Navigate to core package
cd venice-ai-sdk/packages/core

# Ensure you're logged in to npm
npm whoami
# If not logged in:
npm login

# Publish (dry run first)
npm publish --dry-run

# Publish for real
npm publish --access public

# Verify publication
npm view @venice-dev-tools/core@2025.11.22
```

### 5. Publish Other Packages (if needed)

```bash
# Node package
cd ../node
npm publish --access public

# Web package
cd ../web
npm publish --access public
```

### 6. Update Documentation Site (if applicable)

If you have a documentation site (e.g., GitHub Pages, Vercel):

```bash
# Update documentation
# Deploy to your hosting platform
# Ensure new version is reflected
```

### 7. Announce the Release

#### GitHub Discussion
- Post in Discussions → Announcements
- Link to release notes
- Highlight key features

#### Social Media (Optional)
- Twitter/X
- LinkedIn
- Reddit (r/VeniceAI if exists)
- Discord/Slack communities

**Sample Announcement**:
```
🚀 Venice AI SDK v2025.11.22 is here!

✅ 100% Swagger API Compliance
✨ 7 New Chat Parameters
💡 Enhanced Developer Experience

Now with frequency_penalty, presence_penalty, logprobs, and more!

📦 npm install @venice-dev-tools/core@2025.11.22

Release notes: [link]
```

---

## Post-Release Checklist

- [ ] Tag created and pushed
- [ ] GitHub release published
- [ ] npm package published
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Announcement posted
- [ ] Close related issues/PRs
- [ ] Monitor for issues

---

## Rollback Plan (If Needed)

If critical issues are discovered:

### 1. Deprecate npm Package
```bash
npm deprecate @venice-dev-tools/core@2025.11.22 "Critical bug found, use v2025.11.83"
```

### 2. Update GitHub Release
- Edit release on GitHub
- Add warning banner at top
- Mark as pre-release

### 3. Publish Hotfix
```bash
# Create hotfix branch
git checkout -b hotfix/v2025.11.22.1

# Fix issues
# ... make changes ...

# Commit and tag
git commit -m "fix: critical bug in v2025.11.22"
git tag v2025.11.22.1
git push origin hotfix/v2025.11.22.1
git push origin v2025.11.22.1

# Publish hotfix
npm publish
```

---

## Files Reference

All release materials are ready in the repository:

- `GITHUB_RELEASE_v2025.11.22.md` - GitHub release content
- `RELEASE_NOTES_2025.11.22.md` - Full release notes
- `CHANGELOG_ENTRY.md` - Changelog entry
- `VERSION_UPDATE_SUMMARY.txt` - Quick summary
- `SWAGGER_VERIFICATION_REPORT.md` - Verification details

---

## Support After Release

Monitor these channels for 48 hours after release:

1. **GitHub Issues** - Watch for bug reports
2. **npm Downloads** - Track adoption
3. **GitHub Discussions** - Answer questions
4. **Social Media** - Respond to feedback

---

## Success Metrics

Track these metrics post-release:

- npm downloads (daily/weekly)
- GitHub stars/forks
- Issue reports (bugs vs features)
- Community feedback
- Documentation page views

---

## Notes

- This is a **non-breaking release** - safe for all users
- All new features are **optional**
- **100% backward compatible**
- Verified against official Swagger spec

---

**Ready to publish!** 🚀

All materials are prepared and the release is ready to go live.
