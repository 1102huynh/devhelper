module.exports = {
  default: {
    require: [
      'tests/e2e/support/**/*.js',
      'tests/e2e/step-definitions/**/*.js'
    ],
    format: [
      'progress',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json'
    ],
    paths: ['tests/e2e/features/**/*.feature'],
    publish: false
  }
};

