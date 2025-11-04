const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Define explicitly where the mobile project is
const projectRoot = __dirname;
// Define the monorepo root directory
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Ensure Metro knows the correct project root
config.projectRoot = projectRoot;
// Watch both the project directory and the workspace root
config.watchFolders = [projectRoot, workspaceRoot];

// Configure resolver to look for node_modules in both locations
config.resolver = config.resolver || {};
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
