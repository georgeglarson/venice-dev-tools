#!/usr/bin/env node
/**
 * Postinstall helper for venice-dev-tools.
 *
 * Responsibilities:
 *   1. Ensure the CLI entry point is executable.
 *   2. Install package-specific dependencies the first time the package is installed.
 *   3. Create consumer-visible symlinks for the internal @venice-dev-tools/* packages
 *      so that imports like `@venice-dev-tools/core` work out of the box.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function log(message) {
  console.log(`[venice-dev-tools] ${message}`);
}

function warn(message, error) {
  console.warn(`[venice-dev-tools] ${message}`);
  if (error) {
    console.warn(error);
  }
}

function ensureCliIsExecutable(packageRoot) {
  const cliPath = path.join(packageRoot, 'bin', 'venice-cli.js');
  try {
    fs.chmodSync(cliPath, 0o755);
    log(`CLI marked as executable: ${cliPath}`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      warn('Failed to set CLI executable bit', error);
    }
  }
}

function ensureNodePackageDependencies(packageRoot) {
  const nodePackageDir = path.join(packageRoot, 'packages', 'node');
  const nodeModulesPath = path.join(nodePackageDir, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    return;
  }

  try {
    log('Installing venice-dev-tools node package dependencies...');
    execSync('npm install --no-save', {
      cwd: nodePackageDir,
      stdio: 'inherit',
    });
  } catch (error) {
    warn('Failed to install node package dependencies', error);
  }
}

function ensureSymlink(targetDir, linkDir, scopeName) {
  const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
  const linkPath = path.join(linkDir, scopeName);

  try {
    const existingTarget = fs.realpathSync(linkPath);
    if (existingTarget === targetDir) {
      return;
    }
    fs.rmSync(linkPath, { recursive: true, force: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  fs.mkdirSync(path.dirname(linkPath), { recursive: true });
  const relativeTarget = path.relative(path.dirname(linkPath), targetDir) || '.';
  const linkTarget =
    symlinkType === 'junction' ? path.resolve(targetDir) : relativeTarget;
  fs.symlinkSync(linkTarget, linkPath, symlinkType);
  log(`Linked ${linkPath} -> ${targetDir}`);
}

function resolveConsumerRoot(packageRoot) {
  const envCandidates = [
    process.env.npm_config_local_prefix,
    process.env.INIT_CWD,
  ]
    .filter(Boolean)
    .map((dir) => path.resolve(dir));

  for (const candidate of envCandidates) {
    if (fs.existsSync(path.join(candidate, 'node_modules'))) {
      return candidate;
    }
  }

  const pnpmMarker = `${path.sep}node_modules${path.sep}.pnpm${path.sep}`;
  const markerIndex = packageRoot.indexOf(pnpmMarker);
  if (markerIndex !== -1) {
    const candidate = packageRoot.slice(0, markerIndex);
    if (fs.existsSync(path.join(candidate, 'node_modules'))) {
      return candidate;
    }
  }

  if (!packageRoot.includes(`${path.sep}.pnpm${path.sep}`)) {
    const inlineCandidate = path.resolve(packageRoot);
    if (fs.existsSync(path.join(inlineCandidate, 'node_modules'))) {
      return inlineCandidate;
    }
  }

  const fallback = path.resolve(packageRoot, '..', '..');
  if (fs.existsSync(path.join(fallback, 'node_modules'))) {
    return fallback;
  }

  return null;
}

function ensurePackageSymlinks(packageRoot) {
  const packages = ['core', 'node', 'web'];
  const consumerRoot = resolveConsumerRoot(packageRoot);

  if (!consumerRoot) {
    warn(
      'Unable to determine the consumer project root. ' +
        'Skipping inter-package symlink creation.',
    );
    return;
  }

  const consumerNodeModules = path.join(consumerRoot, 'node_modules');
  const scopeDir = path.join(consumerNodeModules, '@venice-dev-tools');
  packages.forEach((pkgName) => {
    const targetDir = path.join(packageRoot, 'packages', pkgName);
    if (!fs.existsSync(targetDir)) {
      warn(`Package directory not found for ${pkgName}: ${targetDir}`);
      return;
    }
    try {
      ensureSymlink(targetDir, scopeDir, pkgName);
    } catch (error) {
      warn(`Failed to link @venice-dev-tools/${pkgName}`, error);
    }
  });
}

function main() {
  const packageRoot = path.resolve(__dirname, '..');
  ensureCliIsExecutable(packageRoot);
  ensureNodePackageDependencies(packageRoot);
  ensurePackageSymlinks(packageRoot);
}

main();
