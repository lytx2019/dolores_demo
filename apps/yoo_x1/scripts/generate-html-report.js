const reporter = require('cucumber-html-reporter');
const path = require('path');
const fs = require('fs');

// 确保报告目录存在（相对于当前脚本的位置）
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const options = {
  theme: 'bootstrap',
  jsonFile: path.join(reportsDir, 'cucumber-report.json'),
  output: path.join(reportsDir, 'cucumber-report.html'),
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false, // 设置为 true 可以自动打开报告
  metadata: {
    "App Version": "0.1.0",
    "Test Environment": "Development",
    "Browser": "Node.js Test Environment",
    "Platform": process.platform,
    "Parallel": "1",
    "Executed": "Local",
    "Project": "东方妖妖梦 (Touhou Youyoumu)",
    "Description": "Cucumber BDD 测试报告 - 东方妖妖梦游戏功能测试"
  },
  failedSummaryReport: true,
};

// 检查 JSON 文件是否存在
if (!fs.existsSync(options.jsonFile)) {
  console.error('❌ JSON 报告文件不存在:', options.jsonFile);
  console.log('请先运行测试生成 JSON 报告: npm test');
  process.exit(1);
}

try {
  reporter.generate(options);
  console.log('✅ HTML 测试报告已生成:');
  console.log('📁 报告位置:', options.output);
  console.log('🌐 在浏览器中打开:', `file://${path.resolve(options.output)}`);
  
  // 显示报告摘要
  const jsonData = JSON.parse(fs.readFileSync(options.jsonFile, 'utf8'));
  if (jsonData && jsonData.length > 0) {
    const feature = jsonData[0];
    console.log('\n📊 测试摘要:');
    console.log(`   功能总数: ${jsonData.length}`);
    console.log(`   场景总数: ${jsonData.reduce((sum, f) => sum + (f.elements ? f.elements.length : 0), 0)}`);
    console.log(`   步骤总数: ${jsonData.reduce((sum, f) => sum + (f.elements ? f.elements.reduce((stepSum, e) => stepSum + (e.steps ? e.steps.length : 0), 0) : 0), 0)}`);
  }
  
} catch (error) {
  console.error('❌ 生成 HTML 报告时出错:', error.message);
  process.exit(1);
} 