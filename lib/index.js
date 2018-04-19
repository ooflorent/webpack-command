const updateNotifier = require('update-notifier');
// const webpack = require('webpack');

const weblog = require('webpack-log');
const loader = require('@webpack-contrib/config-loader');

const pkg = require('../package.json');

const Command = require('./commands/Command');
const { apply } = require('./flags');
const WebpackWoofError = require('./WebpackWoofError');

module.exports = (cli) => {
  updateNotifier({ pkg }).notify();

  process.env.WEBPACK_WOOF = true;

  const { argv } = cli;
  const log = weblog({
    name: 'woof',
    id: 'webpack-woof',
    level: argv.logLevel || 'info',
    timestamp: argv.logTime,
  });
  const loaderOptions = {
    configPath: argv.config,
    require: argv.require,
  };

  loader(loaderOptions).then(({ config }) => {
    let target = config;

    if (argv.configName) {
      if (Array.isArray(config)) {
        const index = config.find((conf) => conf.name === argv.configName);

        if (index < 0) {
          throw new WebpackWoofError(
            `The --config-name specified was not found`
          );
        }

        target = config[index];
      } else {
        throw new WebpackWoofError(
          '--config-name was used but the specified configuration is not an Array'
        );
      }
    }

    if (apply(argv, target)) {
      // TODO: webpack(target);
      console.log(target);
    } else {
      process.exit(1);
    }
  });

  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
      // eslint-disable-line no-loop-func
      log.info(`Process Ended via ${sig}`);
      process.exit(0);
    });
  }
};

module.exports.Command = Command;