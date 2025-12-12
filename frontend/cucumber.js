module.exports = {
  default: {
    require: ['tests/e2e/step-definitions/**/*.js'],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json'
    ],
    paths: ['tests/e2e/features/**/*.feature'],
    publishQuiet: true
  }
};

