import { chain, Rule, Tree } from '@angular-devkit/schematics';
import { formatFiles, readWorkspace } from '@nrwl/workspace';
import { join } from 'path';
import { importConstants } from '../../utils/require-shim';

const { CONFIG_FILE, CONFIG_FILES } = importConstants();

const defaultConfig = `const withSass = require('@zeit/next-sass');
const withLess = require('@zeit/next-less');
const withStylus = require('@zeit/next-stylus');
const withCSS = require('@zeit/next-css');

/*
 * This file was generated by Nx 9.2.0 to allow greater control over configuration
 * for Next apps. To optimize your configuration please update the following export
 * with only the style plugin you are using.
 *
 * e.g. module.exports = withCSS({ cssModules: false });
 */
module.exports = withStylus(withLess(withSass(withCSS({
  // Set this to true if you use CSS modules.
  // See: https://github.com/css-modules/css-modules
  cssModules: false
}))));
`;

export default function update(): Rule {
  return chain([
    (host: Tree) => {
      const workspaceJson = readWorkspace(host);
      const nextProjects = Object.keys(workspaceJson.projects)
        .map((name) => {
          const p = workspaceJson.projects[name];
          const buildBuilder =
            p.architect && p.architect.build && p.architect.build.builder;
          return buildBuilder === '@nrwl/next:build' ? p : null;
        })
        .filter(Boolean);

      nextProjects.forEach((p) => {
        // Next.js 12 specifies two config files.
        const configFile = Array.isArray(CONFIG_FILES)
          ? CONFIG_FILES[0]
          : CONFIG_FILE;
        const configPath = join(p.root, configFile);
        if (!host.exists(configPath)) {
          host.create(configPath, defaultConfig);
        }
      });
    },
    formatFiles(),
  ]);
}
