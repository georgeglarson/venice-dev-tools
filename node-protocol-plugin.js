// Custom webpack plugin to handle node: protocol imports
class NodeProtocolPlugin {
  constructor() {}

  apply(compiler) {
    // Intercept the normal-module-factory hook
    compiler.hooks.normalModuleFactory.tap('NodeProtocolPlugin', (factory) => {
      // Intercept the resolver hook
      factory.hooks.beforeResolve.tap('NodeProtocolPlugin', (resolveData) => {
        if (resolveData.request.startsWith('node:')) {
          // Remove the node: prefix
          const moduleName = resolveData.request.substring(5);
          resolveData.request = moduleName;
        }
        // Don't return anything for a bailing hook
      });
    });
  }
}

module.exports = NodeProtocolPlugin;