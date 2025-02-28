# GitHub Pages Setup Instructions

To properly configure GitHub Pages for this repository, follow these steps:

1. Go to your GitHub repository
2. Click on "Settings"
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select "Deploy from a branch"
5. Under "Branch", select "main" and "/docs" folder
6. Click "Save"

After saving, GitHub will provide you with a URL where your site is published. It may take a few minutes for the changes to take effect.

## Troubleshooting

If you're experiencing styling issues:

1. Make sure all the files in the docs directory are properly committed and pushed
2. Check that the branch and folder settings are correct
3. Wait a few minutes for GitHub to rebuild the site
4. Clear your browser cache or try in an incognito/private window

## Local Testing

To test the site locally before pushing to GitHub:

1. Install Jekyll and Bundler:
   ```
   gem install jekyll bundler
   ```

2. Navigate to the docs directory:
   ```
   cd docs
   ```

3. Create a Gemfile:
   ```
   echo "source 'https://rubygems.org'" > Gemfile
   echo "gem 'github-pages', group: :jekyll_plugins" >> Gemfile
   ```

4. Install dependencies:
   ```
   bundle install
   ```

5. Run the local server:
   ```
   bundle exec jekyll serve
   ```

6. Open your browser to `http://localhost:4000`