# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions of the Venice AI SDK:

| Version | Supported          | Status |
|---------|-------------------|--------|
| 2025.11.x | ✅ Current Release | Active security fixes |
| 2025.10.x | ✅ Previous Month  | Critical fixes only |
| < 2025.10 | ❌ Archived        | No security updates |

**Calendar Versioning:** Our releases follow the `YYYY.MM.D` format. We provide active security support for the current month's release and critical security fixes for the previous month's release.

## Security Update Policy

- **Critical vulnerabilities** (CVSS 9.0+): Patched within 24-48 hours
- **High severity** (CVSS 7.0-8.9): Patched within 7 days
- **Medium severity** (CVSS 4.0-6.9): Patched in next scheduled release
- **Low severity** (CVSS < 4.0): Addressed in regular maintenance

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

### Preferred Reporting Method

Email security reports to: **security@venice.ai** (or your designated security contact)

Include in your report:
- **Description:** Clear explanation of the vulnerability
- **Impact:** Potential security impact and attack scenarios
- **Reproduction:** Step-by-step instructions to reproduce the issue
- **Affected Versions:** Which SDK versions are vulnerable
- **Suggested Fix:** (Optional) Proposed solution or patch

### What to Expect

1. **Acknowledgment:** We will acknowledge receipt within 24 hours
2. **Initial Assessment:** Within 3 business days, we'll provide an initial severity assessment
3. **Updates:** We'll keep you informed of our progress every 5 business days
4. **Resolution:** Once fixed, we'll coordinate disclosure timing with you
5. **Credit:** We'll publicly credit you in our security advisory (unless you prefer anonymity)

### Coordinated Disclosure

We follow responsible disclosure practices:

- We request **90 days** to develop, test, and release a fix before public disclosure
- We will keep you updated throughout the fix development process
- We coordinate public disclosure with you to ensure users can upgrade before exploit details are published
- We publish security advisories via [GitHub Security Advisories](https://github.com/your-org/mgx-veniceai-sdk/security/advisories)

## Security Best Practices for Users

### API Key Security

**Never hardcode API keys:**
```typescript
// ❌ BAD - Never do this
const client = new VeniceClient({ apiKey: 'sk-1234567890' });

// ✅ GOOD - Use environment variables
const client = new VeniceClient({ apiKey: process.env.VENICE_API_KEY });
```

**Rotate keys regularly:**
- Rotate API keys every 90 days
- Immediately rotate if a key is compromised
- Use different keys for development, staging, and production

**Restrict key permissions:**
- Use the principle of least privilege
- Create separate keys for different applications
- Monitor key usage via Venice.ai dashboard

### Secure Configuration

**Use HTTPS only:**
```typescript
// Default configuration uses HTTPS
const client = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY,
  // baseURL defaults to https://api.venice.ai
});
```

**Set reasonable timeouts:**
```typescript
const client = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY,
  timeout: 60000, // 60 seconds - prevents indefinite hangs
});
```

**Enable request logging (development only):**
```typescript
const client = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY,
  logLevel: process.env.NODE_ENV === 'production' ? 0 : 1, // INFO in dev only
});
```

### Dependency Security

**Keep dependencies updated:**
```bash
# Check for security vulnerabilities
pnpm audit

# Update to latest secure versions
pnpm update

# Or use automated tools
npx npm-check-updates -u
```

**Use lock files:**
- Always commit `pnpm-lock.yaml` to version control
- This ensures reproducible builds and prevents supply chain attacks

### Client-Side Security (Browser)

**Never expose API keys in browser code:**
```typescript
// ❌ BAD - API key exposed to browser
const client = new VeniceClient({ apiKey: 'sk-1234567890' });

// ✅ GOOD - Proxy through your backend
fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message: 'Hello' })
});
```

**Use Content Security Policy (CSP):**
```html
<meta http-equiv="Content-Security-Policy" 
      content="connect-src 'self' https://api.venice.ai;">
```

**Sanitize user input:**
```typescript
import DOMPurify from 'dompurify';

const sanitizedInput = DOMPurify.sanitize(userInput);
const response = await client.chat.completions.create({
  messages: [{ role: 'user', content: sanitizedInput }]
});
```

## Known Security Considerations

### Rate Limiting

The SDK includes built-in rate limiting to prevent abuse:

```typescript
const client = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY,
  rateLimit: {
    maxRequestsPerMinute: 60,
    maxConcurrentRequests: 5,
  },
});
```

Adjust these limits based on your Venice.ai plan and usage patterns.

### Error Handling

Avoid leaking sensitive information in error messages:

```typescript
try {
  const response = await client.chat.completions.create({ /* ... */ });
} catch (error) {
  // ❌ BAD - May leak API keys or sensitive data
  console.error('Error:', error);

  // ✅ GOOD - Log sanitized error
  if (error instanceof VeniceAPIError) {
    console.error('API error:', { code: error.code, status: error.statusCode });
  } else {
    console.error('Unexpected error occurred');
  }
}
```

### Data Privacy

**User data handling:**
- The SDK does not log or store user data by default
- Enable request logging only in development environments
- Review Venice.ai's [Privacy Policy](https://venice.ai/privacy) for data handling practices

**GDPR Compliance:**
- Ensure you have user consent before processing personal data
- Implement data retention policies
- Provide data export and deletion capabilities

## Security Advisories

Published security advisories are available at:
- GitHub Security Advisories: https://github.com/your-org/mgx-veniceai-sdk/security/advisories
- npm Security Advisories: https://www.npmjs.com/package/@venice-dev-tools/core?activeTab=security

Subscribe to security notifications:
```bash
# Watch repository for security updates
gh repo subscribe your-org/mgx-veniceai-sdk

# Enable npm security notifications
npm config set audit true
```

## Bug Bounty Program

We currently do not offer a bug bounty program, but we deeply appreciate security researchers who report vulnerabilities responsibly. We will:

- Publicly credit researchers in security advisories (with permission)
- Provide early access to fixes for verification
- Consider researcher feedback in our security roadmap

## Security Audit History

| Date | Auditor | Scope | Report |
|------|---------|-------|--------|
| TBD  | Pending | Full SDK | Not yet conducted |

We welcome security audits from qualified third parties. Contact security@venice.ai to coordinate.

## Questions?

For security-related questions that are **not** vulnerability reports, you can:
- Open a [GitHub Discussion](https://github.com/your-org/mgx-veniceai-sdk/discussions) (for general security questions)
- Email: security@venice.ai (for private security inquiries)

For non-security issues, please use [GitHub Issues](https://github.com/your-org/mgx-veniceai-sdk/issues).

## Acknowledgments

We thank the following security researchers for responsible disclosure:

- *No vulnerabilities reported yet*

---

**Last Updated:** 2025-11-06  
**Policy Version:** 1.0
