const fs = require('fs');
const path = require('path');

// 确保报告目录存在
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

module.exports = {
  default: {
    // Feature files location
    paths: ['story/*.feature'],
    
    // Step definitions and support files location
    require: [
      'tests/step-definitions/**/*.{js,ts}',
      'tests/support/**/*.{js,ts}'
    ],
    
    // Require modules before executing features
    requireModule: [
      'ts-node/register'
    ],
    
    // Format options
    format: [
      'progress-bar',
      'json:reports/cucumber-report.json'
    ],
    
    // Format options
    formatOptions: {
      snippetInterface: 'async-await'
    },
    
    // Parallel execution settings
    parallel: 1,
    
    // Retry failed scenarios
    retry: 1,
    
    // World parameters
    worldParameters: {
      appUrl: 'http://localhost:3000'
    }
  }
}; 