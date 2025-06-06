import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';

// 拜访记录字段配置接口
interface VisitRecordFieldConfig {
  字段: string;
  类型: string;
  是否必填: string;
}

// 拜访记录数据接口
interface VisitRecord {
  id?: string;
  客户: string;
  拜访日期: string;
  客户阶段: string;
  详细沟通记录?: string;
  销售人员: string;
  创建时间?: Date;
}

// Background - 拜访记录字段配置表
Given('系统已定义「拜访记录字段配置表」:', function (this: CustomWorld, dataTable: DataTable) {
  const rawConfig = dataTable.hashes();
  const fieldConfigs: VisitRecordFieldConfig[] = rawConfig.map(row => ({
    字段: row['字段'],
    类型: row['类型'],
    是否必填: row['是否必填']
  }));
  
  this.crmState.visitRecordFieldConfigs = fieldConfigs;
  console.log('Visit record field configurations loaded:', fieldConfigs.length, 'fields');
});

// Rule: 创建拜访
Given('已存在客户 {string}', function (this: CustomWorld, customerName: string) {
  // 确保客户存在
  this.crmState.customers = this.crmState.customers || [];
  
  let customer = this.crmState.customers.find((c: any) => c.客户名称 === customerName);
  if (!customer) {
    customer = {
      id: `customer_${Date.now()}`,
      客户名称: customerName,
      客户行业: '软件',
      客户分层: 'A',
      创建时间: new Date()
    };
    this.crmState.customers.push(customer);
  }
  
  console.log('Customer exists:', customerName);
});

When('销售人员点击「新建拜访记录」', function (this: CustomWorld) {
  this.crmState.currentScreen = 'visit_record_create_form';
  this.crmState.visitRecordForm = {};
  console.log('Opened new visit record form');
});

When('选择客户 {string}', function (this: CustomWorld, customerName: string) {
  this.crmState.visitRecordForm = this.crmState.visitRecordForm || {};
  this.crmState.visitRecordForm['客户'] = customerName;
  console.log('Selected customer:', customerName);
});

When('选择日期 {string}', function (this: CustomWorld, visitDate: string) {
  this.crmState.visitRecordForm = this.crmState.visitRecordForm || {};
  this.crmState.visitRecordForm['拜访日期'] = visitDate;
  console.log('Selected visit date:', visitDate);
});

When('选择客户阶段 {string}', function (this: CustomWorld, customerStage: string) {
  this.crmState.visitRecordForm = this.crmState.visitRecordForm || {};
  this.crmState.visitRecordForm['客户阶段'] = customerStage;
  console.log('Selected customer stage:', customerStage);
});

// 重用客户管理中的"点击「保存」"步骤，但针对拜访记录
When('点击「保存」', function (this: CustomWorld) {
  // 验证必填字段
  const requiredFields = this.crmState.visitRecordFieldConfigs
    ?.filter((config: VisitRecordFieldConfig) => config.是否必填 === '是')
    .map((config: VisitRecordFieldConfig) => config.字段) || [];
  
  const visitRecordForm = this.crmState.visitRecordForm || {};
  const missingFields = requiredFields.filter((field: string) => 
    !visitRecordForm[field] || 
    visitRecordForm[field].trim() === ''
  );
  
  if (missingFields.length > 0) {
    this.crmState.lastError = `${missingFields[0]}为必填项`;
    this.crmState.saveResult = 'failed';
  } else {
    // 保存拜访记录
    const newVisitRecord: VisitRecord = {
      id: `visit_${Date.now()}`,
      客户: visitRecordForm['客户'],
      拜访日期: visitRecordForm['拜访日期'],
      客户阶段: visitRecordForm['客户阶段'],
      详细沟通记录: visitRecordForm['详细沟通记录'],
      销售人员: this.crmState.currentUser?.name || '未知销售人员',
      创建时间: new Date()
    };
    
    this.crmState.visitRecords = this.crmState.visitRecords || [];
    this.crmState.visitRecords.push(newVisitRecord);
    this.crmState.lastMessage = '保存成功';
    this.crmState.saveResult = 'success';
  }
  
  console.log('Save visit record attempted, result:', this.crmState.saveResult);
});

Then('系统生成拜访记录', function (this: CustomWorld) {
  expect(this.crmState.saveResult).to.equal('success');
  expect(this.crmState.visitRecords).to.be.an('array');
  
  const visitRecords = this.crmState.visitRecords || [];
  expect(visitRecords.length).to.be.greaterThan(0);
  
  const latestRecord = visitRecords[visitRecords.length - 1];
  expect(latestRecord).to.exist;
  expect(latestRecord.id).to.exist;
  
  console.log('Visit record generated successfully');
});

Then('拜访记录关联客户 {string}', function (this: CustomWorld, customerName: string) {
  expect(this.crmState.visitRecords).to.be.an('array');
  
  const visitRecords = this.crmState.visitRecords || [];
  const latestRecord = visitRecords[visitRecords.length - 1];
  expect(latestRecord).to.exist;
  expect(latestRecord.客户).to.equal(customerName);
  
  console.log('Visit record linked to customer:', customerName);
});

// Rule: 权限查看
Given('管理者进入「拜访记录」页面', function (this: CustomWorld) {
  // 设置管理者用户
  this.crmState.currentUser = {
    id: 'manager_001',
    name: '李管理',
    role: '管理者',
    isLoggedIn: true
  };
  
  this.crmState.currentScreen = 'visit_records_list';
  console.log('Manager entered visit records page');
});

When('页面加载完成', function (this: CustomWorld) {
  // 模拟页面加载完成
  this.crmState.pageLoaded = true;
  
  // 如果是管理者，加载所有拜访记录
  if (this.crmState.currentUser?.role === '管理者') {
    this.crmState.displayedVisitRecords = this.crmState.visitRecords || [];
  } else {
    // 如果是销售人员，只显示自己的记录
    this.crmState.displayedVisitRecords = this.crmState.visitRecords?.filter(
      (record: VisitRecord) => record.销售人员 === this.crmState.currentUser?.name
    ) || [];
  }
  
  console.log('Page loading completed');
});

Then('系统展示全员拜访记录列表', function (this: CustomWorld) {
  expect(this.crmState.currentUser?.role).to.equal('管理者');
  expect(this.crmState.pageLoaded).to.be.true;
  expect(this.crmState.displayedVisitRecords).to.be.an('array');
  
  // 验证显示的是所有记录，不仅仅是当前用户的记录
  expect(this.crmState.displayedVisitRecords).to.deep.equal(this.crmState.visitRecords || []);
  
  console.log('All visit records displayed for manager');
}); 