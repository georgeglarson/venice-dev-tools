# Venice AI SDK Documentation

This directory contains the GitHub Pages site for the Venice AI SDK documentation.

## Directory Structure

- **[_config.yml](_config.yml)**: Jekyll configuration file
- **[_includes/](_includes/)**: Jekyll includes (navigation, etc.)
- **[_layouts/](_layouts/)**: Jekyll layouts
- **[assets/](assets/)**: CSS, JavaScript, and other assets
- **[documentation/](documentation/)**: The actual documentation content
  - **[api-reference/](documentation/api-reference/)**: API reference documentation
  - **[advanced/](documentation/advanced/)**: Advanced topics
  - **[examples/](documentation/examples/)**: Code examples
  - **[troubleshooting.md](documentation/troubleshooting.md)**: Troubleshooting guide
- **[character-interaction.md](character-interaction.md)**: Character interaction guide
- **[cli.md](cli.md)**: CLI reference
- **[demo.md](demo.md)**: Live demo
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Deployment guide
- **[index.md](index.md)**: Main documentation page

## Building the Documentation Locally

To build and test the documentation locally:

```bash
cd docs
bundle install
bundle exec jekyll serve
```

This will start a local server at `http://localhost:4000/venice-dev-tools/`.

## Contributing to Documentation

If you'd like to contribute to the documentation, please follow these guidelines:

1. Use Markdown for all documentation files
2. Follow the existing structure and style
3. Include code examples where appropriate
4. Test all code examples to ensure they work
5. Update the navigation in `_includes/navigation.html` if adding new pages

The actual documentation content is in the [documentation/](documentation/) directory. This separation helps keep the GitHub Pages files separate from the actual documentation content.