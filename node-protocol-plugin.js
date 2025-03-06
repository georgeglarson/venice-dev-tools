/**
 * Node Protocol Plugin for Webpack
 *
 * This plugin handles node: protocol imports by removing the protocol prefix
 * and letting webpack's normal resolution handle the module.
 */

class NodeProtocolPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    // Hook into the normal module factory
    compiler.hooks.normalModuleFactory.tap('NodeProtocolPlugin', (factory) => {
      // Tap into the factory's resolver
      factory.hooks.beforeResolve.tap('NodeProtocolPlugin', (resolveData) => {
        if (resolveData && resolveData.request && resolveData.request.startsWith('node:')) {
          // Remove the node: prefix
          resolveData.request = resolveData.request.substring(5);
        }
        // Don't return anything for a bailing hook
      });
    });
  }
}

module.exports = NodeProtocolPlugin;