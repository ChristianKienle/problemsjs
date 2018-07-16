#!/usr/bin/env node

// ---------------------------------------------
//                      ~ 🖖  ~
//               LIVE LONG AND PROPSER
//                      ~ 🖖  ~
// ---------------------------------------------

// @flow
// We are a cli => console is fine.
/* eslint no-console: 0 */
'use strict';

const log = require('cmklog');
const {
  fromFile: configurationFromFile,
  defaultConfiguration,
  resolved: resolvedConfiguration,
} = require('./src/lib/config');
const Path = require('path');
const fs = require('fs');
const { App, CLI } = require('./src');

const APP_NAME = 'problemsjs';
const APP_NAME_PRETTY = 'Problem.js';
const CONFIG_DEFAULT_FILENAME = '.problemsjs.config.json';
const APP_WEB = 'https://github.com/ChristianKienle/problemsjs';

const exitCLI = () => process.exit(1);
const uncaughtErrorHandler = (error) => {
  console.error(error);
  log.error(`Caught error: ${error}.`);
  exitCLI();
  return;
};

/*:: type ViewOptions = { configPath: string; }; */
const view = ({ configPath } /*: ViewOptions */) => {
  if(fs.existsSync(configPath) == false) {
    console.error(`Configuration file at '${configPath}' does not exist. To create a default configuration file use '${APP_NAME} init' or specify a configuration file which exists by using '--config <path>'.`);
    exitCLI(); return;
  }

  // Load the config
  const config = configurationFromFile(configPath);
  const resolved = resolvedConfiguration(config);
  const app = new App(config);
  const { openInEditorCommand } = resolved;
  const cli = new CLI({ openInEditorCommand });
  app.delegate = cli;
  app.start();
};

const init = () => {
  const configPath = Path.join(process.cwd(), CONFIG_DEFAULT_FILENAME);
  console.log(`Creating a new configuration file at ${configPath}…`);
  const fileExists = fs.existsSync(configPath);
  if(fileExists) {
    console.error(`Unable to create configuration file at ${configPath} because there is already a file.`);
    exitCLI(); return;
  }
  const lines = [
    'Problems.js seems to work! 😎',
    'You have the following options:',
    '-------------------------------------------------------',
    `  • Open ${CONFIG_DEFAULT_FILENAME} and add useful tasks.`,
    `  • Read the docs: ${APP_WEB}`,
    '  • Hit CTRL+C to exit.',
    '-------------------------------------------------------',
    'Have fun.',
  ];
  const joined = lines.join('\n');
  const config = defaultConfiguration();
  config.tasks = [
    {
      name: 'sample task',
      matcher: 'line',
      program: 'echo',
      args: [joined],
      cwd: '${workspaceFolder}',
    },
  ];
  config.openInEditorCommand = 'code --goto ${absolutePath}:${line}';

  const configString = JSON.stringify(config, null, '\t');
  fs.writeFileSync(configPath, configString, { encoding: 'utf8'});
  console.log('\nDone! 👍 \n');
  console.log(`You can now use ${APP_NAME_PRETTY} by executing:\n`);
  console.log(`  $ ${APP_NAME} view`);
  console.log('    or');
  console.log(`  $ ${APP_NAME} view --config ${CONFIG_DEFAULT_FILENAME}`);
  console.log('');
  console.log('');
  console.log('            Have fun');
  console.log('🖖  ~ LIVE LONG AND PROPSER ~ 🖖');
};

require('yargs') // eslint-disable-line
  .command({
    command: 'init',
    desc: `Creates a new ${APP_NAME_PRETTY} configuration file in the current directory`,
    handler: () => {
      try {
        init();
      } catch(error) {
        uncaughtErrorHandler(error);
      }
    },
  })
  .command({
    command: 'view',
    desc: 'Displays problems and continiously checks for new problems.',
    builder: (yargs) => {
      yargs
        .option('config', {
          alias: 'c',
          describe: `Use this configuration, overriding ${CONFIG_DEFAULT_FILENAME}`,
          default: CONFIG_DEFAULT_FILENAME,
        })
        .option('log', {
          alias: 'l',
          describe: 'Write log messages to this file.',
        }).coerce(['log', 'config'], Path.resolve);
    },
    handler: (argv) => {
      const { config } = argv;
      const logPath= argv.log;
      if(logPath != null && typeof logPath === 'string') {
        console.log('Logging to %s', logPath);
        log.setDestination(logPath);
      }
      try {
        view({ configPath: config });
      } catch(error) {
        uncaughtErrorHandler(error);
      }
    },
  })
  .help()
  .wrap(72)
  .demandCommand()
  .argv;
