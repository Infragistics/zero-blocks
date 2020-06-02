// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'jasmine-spec-tags', '@angular-devkit/build-angular'],
    files: [
      { pattern: '../../node_modules/hammerjs/hammer.min.js', watched: false },
      { pattern: '../../node_modules/hammer-simulator/index.js', watched: false },
      { pattern: './test.css', watched: false },
      { pattern: '../../dist/igniteui-angular/styles/igniteui-angular.css', watched: false }
    ],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-spec-tags'),
      require('karma-junit-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-spec-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: true,
      jasmine: {
        random: false
      },
      tagPrefix: '#',
      tags: 'grid',
      skipTags: 'perf'
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../../coverage/grid'),
      reports: ['lcovonly', 'json', 'cobertura'],
      fixWebpackSourcePaths: true
    },
    reporters: ['junit'],
    junitReporter: {
      outputDir: ''
    },
    port: 9876,
    colors: false,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browserSocketTimeout: 80000,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu'],
        debug: false
      }
    },
    singleRun: true
  });
};
