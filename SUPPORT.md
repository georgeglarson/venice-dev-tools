# Support

Welcome to the Venice AI SDK support resources! This document helps you find the right channel for your question or issue.

## Quick Links

- **Documentation:** https://github.com/georgeglarson/venice-dev-tools
- **Examples:** [examples/](examples/)
- **API Reference:** [docs/api/](docs/api/)
- **Issue Tracker:** https://github.com/georgeglarson/venice-dev-tools/issues
- **Discussions:** https://github.com/georgeglarson/venice-dev-tools/discussions

## Getting Help

### Before You Ask

1. **Search existing resources:**
   - Check the [README](README.md) and [documentation](docs/)
   - Browse [examples](examples/) for similar use cases
   - Search [existing issues](https://github.com/georgeglarson/venice-dev-tools/issues?q=is%3Aissue)
   - Look through [discussions](https://github.com/georgeglarson/venice-dev-tools/discussions)

2. **Verify your setup:**
   - Ensure you're using the latest SDK version: `pnpm list @venice-dev-tools/core`
   - Check that your API key is valid: https://venice.ai/settings/api
   - Review the [troubleshooting guide](examples/README.md#troubleshooting)

### Where to Get Help

#### For SDK Questions & Usage Help

**Use GitHub Discussions** → https://github.com/georgeglarson/venice-dev-tools/discussions

Perfect for:
- "How do I...?" questions
- Implementation advice
- Best practices
- Feature discussions
- Showing off your projects

**Categories:**
- 💬 **General** - SDK usage questions
- 💡 **Ideas** - Feature requests and suggestions
- 🙏 **Q&A** - Questions and answers
- 🎉 **Show and Tell** - Share your projects

#### For Bugs & Issues

**Open a GitHub Issue** → https://github.com/georgeglarson/venice-dev-tools/issues/new/choose

Use when:
- The SDK crashes or behaves incorrectly
- You get unexpected errors
- Documentation is wrong or unclear
- You've confirmed a reproducible bug

**Issue Templates:**
- [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) - Report SDK bugs
- [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) - Suggest new features
- [Documentation Issue](.github/ISSUE_TEMPLATE/documentation.md) - Report doc problems

#### For Security Vulnerabilities

**DO NOT use public issues!**

Email security reports to: **security@venice.ai**

See our [Security Policy](SECURITY.md) for details.

#### For Venice.ai Platform Issues

**Not SDK-related?** Contact Venice.ai support:
- Venice.ai Support: https://venice.ai/support
- Venice.ai Documentation: https://docs.venice.ai
- Venice.ai Discord: https://discord.gg/venice-ai (if available)

**Examples of platform issues:**
- API key generation problems
- Billing questions
- Account management
- Model availability
- API rate limits (not SDK rate limiting)

## Contributing

Interested in contributing to the SDK? Check out:
- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Development Setup](CONTRIBUTING.md#development-setup)

## Support Response Times

We are an open-source project maintained by volunteers. Response times vary:

- **Critical security issues:** 24-48 hours
- **Bug reports:** 3-7 days
- **Feature requests:** Best effort
- **Questions/discussions:** Community-driven

## Community Guidelines

When asking for help, please:

1. **Be specific:**
   ```
   ❌ "It doesn't work"
   ✅ "Streaming chat returns error: VeniceAPIError: 400 when using llama-3.3-70b"
   ```

2. **Provide context:**
   - SDK version
   - Node.js version
   - Code sample (minimal, reproducible)
   - Error messages (full stack trace)

3. **Be respectful:**
   - Follow our [Code of Conduct](CODE_OF_CONDUCT.md)
   - Remember maintainers are volunteers
   - Be patient and courteous

4. **Share solutions:**
   - If you solve your issue, post the solution
   - Help others with similar problems
   - Contribute improvements back

## Frequently Asked Questions

### Installation & Setup

**Q: How do I install the SDK?**

```bash
pnpm add @venice-dev-tools/core
```

See [Installation](README.md#install-in-your-project) for details.

**Q: Where do I get an API key?**

Visit https://venice.ai/settings/api and generate a new key.

**Q: How do I set my API key?**

```bash
export VENICE_API_KEY="your-key-here"
```

Never hardcode keys in your source code!

### Common Errors

**Q: "API key not found" error**

- Verify your key is set: `echo $VENICE_API_KEY`
- Check you're passing it correctly: `new VeniceClient({ apiKey: process.env.VENICE_API_KEY })`
- Ensure the key hasn't expired or been revoked

**Q: "Module not found" error**

```bash
cd /home/venice/mgx-veniceai-sdk
pnpm install
pnpm run build
```

**Q: "Rate limit exceeded" error**

See [Rate Limit Handling](examples/typescript/14-rate-limit-handling.ts) example.

**Q: TypeScript examples won't run**

```bash
# Install ts-node
pnpm add -g ts-node typescript

# Or use Bun (recommended)
bun run examples/typescript/01-hello-world.ts
```

### Features & Usage

**Q: Does the SDK support streaming?**

Yes! See [Streaming Chat example](examples/typescript/02-streaming-chat.ts).

**Q: Can I use this in the browser?**

Yes, but never expose your API key client-side. Proxy through your backend.

**Q: Does it support image generation?**

Yes! See [Image Generation example](examples/typescript/05-image-generation.ts).

**Q: How do I upgrade to the latest version?**

```bash
pnpm update @venice-dev-tools/core
```

Check the [CHANGELOG](venice-ai-sdk/CHANGELOG.md) for breaking changes.

## Still Need Help?

Can't find what you're looking for? 

1. **Start a discussion:** https://github.com/georgeglarson/venice-dev-tools/discussions
2. **Join the community** (if available)
3. **Review examples:** [examples/](examples/)

---

**Last Updated:** 2025-11-06  
**Maintainer Contact:** Open an issue or discussion on GitHub
