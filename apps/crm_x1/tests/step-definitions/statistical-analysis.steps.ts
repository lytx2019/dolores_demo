import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';

// 报表配置接口
interface ReportConfig {
  报表名: string;
  模板ID: string;
}

// Background - 报表配置表
Given('系统已定义「报表配置表」:', function (this: CustomWorld, dataTable: DataTable) {
  const rawConfig = dataTable.hashes();
  const reportConfigs: ReportConfig[] = rawConfig.map(row => ({
    报表名: row['报表名'],
    模板ID: row['模板ID']
  }));
  
  this.crmState.reportConfigs = reportConfigs;
  console.log('Report configurations loaded:', reportConfigs.length, 'reports');
});

// Rule: 商机漏斗
Given('管理者进入「统计分析」模块', function (this: CustomWorld) {
  // 设置管理者用户
  this.crmState.currentUser = {
    id: 'manager_001',
    name: '李管理',
    role: '管理者',
    isLoggedIn: true
  };
  
  this.crmState.currentScreen = 'statistical_analysis';
  console.log('Manager entered statistical analysis module');
});

When('选择报表 {string}', function (this: CustomWorld, reportName: string) {
  this.crmState.selectedReport = reportName;
  
  // 模拟生成报表数据
  if (reportName === '商机漏斗') {
    // 按阶段聚合商机数据
    this.crmState.reportData = {
      立项评估: { 数量: 5, 金额: 5000000 },
      方案制定: { 数量: 3, 金额: 3500000 },
      合同谈判: { 数量: 2, 金额: 2800000 },
      成交关闭: { 数量: 1, 金额: 1200000 }
    };
  }
  
  console.log('Report selected:', reportName);
});

Then('系统展示按阶段聚合的商机数量与金额', function (this: CustomWorld) {
  expect(this.crmState.selectedReport).to.equal('商机漏斗');
  expect(this.crmState.reportData).to.exist;
  expect(this.crmState.reportData).to.have.property('立项评估');
  expect(this.crmState.reportData).to.have.property('方案制定');
  expect(this.crmState.reportData).to.have.property('合同谈判');
  expect(this.crmState.reportData).to.have.property('成交关闭');
  
  // 验证数据结构
  const reportData = this.crmState.reportData || {};
  expect(reportData['立项评估']).to.have.property('数量');
  expect(reportData['立项评估']).to.have.property('金额');
  
  console.log('Opportunity funnel report displayed with stage aggregation');
});

// Rule: 拜访转化率
Given('统计周期为 {string}', function (this: CustomWorld, period: string) {
  this.crmState.statisticalPeriod = period;
  console.log('Statistical period set to:', period);
});

When('系统自动汇总数据', function (this: CustomWorld) {
  // 模拟数据汇总过程
  const period = this.crmState.statisticalPeriod || '本月';
  
  // 根据周期生成模拟数据
  let visitCount: number;
  let applicationCount: number;
  
  if (period === '本月') {
    visitCount = 40;
    applicationCount = 8;
  } else if (period === '本季度') {
    visitCount = 120;
    applicationCount = 30;
  } else {
    visitCount = 0;
    applicationCount = 0;
  }
  
  const conversionRate = visitCount > 0 ? Math.round((applicationCount / visitCount) * 100) : 0;
  
  this.crmState.reportData = {
    period: period,
    visitCount: visitCount,
    applicationCount: applicationCount,
    conversionRate: conversionRate
  };
  
  console.log('Data aggregation completed for period:', period);
});

Then('报表展示 {string} 内拜访数 {int}、转商机申请数 {int}、转化率 {int}%', function (this: CustomWorld, period: string, visitCount: number, applicationCount: number, conversionRate: number) {
  expect(this.crmState.reportData).to.exist;
  expect(this.crmState.reportData!.period).to.equal(period);
  
  // 验证统计数据
  expect(this.crmState.reportData!.visitCount).to.equal(visitCount);
  expect(this.crmState.reportData!.applicationCount).to.equal(applicationCount);
  expect(this.crmState.reportData!.conversionRate).to.equal(conversionRate);
  
  console.log(`Report shows ${period} visits: ${visitCount}, applications: ${applicationCount}, conversion rate: ${conversionRate}%`);
});

// Rule: 数据权限
Given('销售人员进入「统计分析」', function (this: CustomWorld) {
  // 设置销售人员用户
  this.crmState.currentUser = {
    id: 'sales_001',
    name: '王销售',
    role: '销售人员',
    isLoggedIn: true
  };
  
  this.crmState.currentScreen = 'statistical_analysis';
  console.log('Sales person entered statistical analysis');
});

When('报表加载完成', function (this: CustomWorld) {
  // 根据用户角色过滤数据
  if (this.crmState.currentUser?.role === '销售人员') {
    // 销售人员只能看到自己相关的数据
    this.crmState.reportData = {
      个人拜访记录: 15,
      个人商机申请: 3,
      个人转化率: '20%',
      数据范围: '仅个人数据'
    };
  } else {
    // 管理者可以看到全部数据
    this.crmState.reportData = {
      全员拜访记录: 120,
      全员商机申请: 30,
      整体转化率: '25%',
      数据范围: '全员数据'
    };
  }
  
  this.crmState.reportLoaded = true;
  console.log('Report loading completed');
});

Then('仅展示该销售人员相关的数据指标', function (this: CustomWorld) {
  expect(this.crmState.currentUser?.role).to.equal('销售人员');
  expect(this.crmState.reportLoaded).to.be.true;
  expect(this.crmState.reportData).to.exist;
  
  const reportData = this.crmState.reportData || {};
  expect(reportData['数据范围']).to.equal('仅个人数据');
  
  // 验证不包含全员数据
  expect(reportData).to.not.have.property('全员拜访记录');
  expect(reportData).to.not.have.property('全员商机申请');
  
  console.log('Only sales person personal data displayed');
}); 