import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';

// 审批状态接口
interface ApprovalStatus {
  状态: string;
}

// Background - 审批状态枚举
Given('系统已定义「审批状态枚举」:', function (this: CustomWorld, dataTable: DataTable) {
  const rawStatuses = dataTable.hashes();
  const approvalStatuses: ApprovalStatus[] = rawStatuses.map(row => ({
    状态: row['状态']
  }));
  
  this.crmState.approvalStatuses = approvalStatuses;
  console.log('Approval statuses loaded:', approvalStatuses.length, 'statuses');
});

// Rule: 转商机审批
Given('商机申请 {string} 状态为 {string}', function (this: CustomWorld, applicationCode: string, currentStatus: string) {
  // 创建商机申请如果不存在
  this.crmState.opportunityApplications = this.crmState.opportunityApplications || [];
  
  let application = this.crmState.opportunityApplications.find((app: any) => app.商机编号 === applicationCode);
  if (!application) {
    application = {
      id: `app_${Date.now()}`,
      商机编号: applicationCode,
      预计签单金额: '1000000',
      产品线: 'AI 平台',
      签单概率: '60%',
      状态: currentStatus as '待审批' | '已通过' | '已驳回',
      申请人: '王销售',
      创建时间: new Date()
    };
    this.crmState.opportunityApplications.push(application);
  } else {
    application.状态 = currentStatus as '待审批' | '已通过' | '已驳回';
  }
  
  this.crmState.currentOpportunityApplication = application;
  console.log('Opportunity application exists:', applicationCode, 'status:', currentStatus);
});

Given('登录用户为对应管理者', function (this: CustomWorld) {
  this.crmState.currentUser = {
    id: 'manager_001',
    name: '李管理',
    role: '管理者',
    isLoggedIn: true
  };
  console.log('Manager user logged in');
});

When('点击「通过」', function (this: CustomWorld) {
  if (!this.crmState.currentOpportunityApplication) {
    throw new Error('No current opportunity application selected');
  }
  
  // 检查用户权限
  if (this.crmState.currentUser?.role !== '管理者') {
    this.crmState.lastError = '无审批权限';
    this.crmState.approvalResult = 'failed';
    return;
  }
  
  // 执行审批通过
  this.crmState.currentOpportunityApplication.状态 = '已通过';
  this.crmState.currentOpportunityApplication.审批人 = this.crmState.currentUser.name;
  this.crmState.currentOpportunityApplication.审批时间 = new Date();
  
  // 创建对应的商机
  const newOpportunity = {
    id: `opp_${Date.now()}`,
    商机编号: this.crmState.currentOpportunityApplication.商机编号,
    客户: '上海星辰科技',
    预计签单金额: this.crmState.currentOpportunityApplication.预计签单金额,
    当前阶段: '立项评估',
    负责人: this.crmState.currentOpportunityApplication.申请人,
    状态: '进行中' as '进行中' | '成交' | '关闭',
    阶段变更历史: []
  };
  
  this.crmState.opportunities = this.crmState.opportunities || [];
  this.crmState.opportunities.push(newOpportunity);
  
  // 发送通知给申请人
  this.crmState.notifications = this.crmState.notifications || [];
  this.crmState.notifications.push(`商机申请${this.crmState.currentOpportunityApplication.商机编号}已通过`);
  
  this.crmState.approvalResult = 'success';
  console.log('Opportunity application approved');
});

Then('商机申请状态更新为 {string}', function (this: CustomWorld, expectedStatus: string) {
  expect(this.crmState.currentOpportunityApplication).to.exist;
  expect(this.crmState.currentOpportunityApplication?.状态).to.equal(expectedStatus);
  
  console.log('Opportunity application status updated to:', expectedStatus);
});

Then('商机状态更新为 {string}', function (this: CustomWorld, expectedOpportunityStatus: string) {
  expect(this.crmState.opportunities).to.be.an('array');
  
  const opportunity = this.crmState.opportunities?.find((opp: any) => 
    opp.商机编号 === this.crmState.currentOpportunityApplication?.商机编号
  );
  expect(opportunity).to.exist;
  expect(opportunity!.状态).to.equal(expectedOpportunityStatus);
  
  console.log('Opportunity status updated to:', expectedOpportunityStatus);
});

Then('通知申请人', function (this: CustomWorld) {
  expect(this.crmState.notifications).to.be.an('array');
  expect(this.crmState.notifications?.length).to.be.greaterThan(0);
  
  const notification = this.crmState.notifications?.find(n => 
    n.includes(this.crmState.currentOpportunityApplication?.商机编号 || '') &&
    n.includes('已通过')
  );
  expect(notification).to.exist;
  
  console.log('Applicant notified about approval');
});

// Scenario: 管理者驳回
When('输入驳回原因 {string}', function (this: CustomWorld, rejectionReason: string) {
  this.crmState.rejectionReason = rejectionReason;
  console.log('Rejection reason entered:', rejectionReason);
});

When('点击「驳回」', function (this: CustomWorld) {
  if (!this.crmState.currentOpportunityApplication) {
    throw new Error('No current opportunity application selected');
  }
  
  // 检查用户权限
  if (this.crmState.currentUser?.role !== '管理者') {
    this.crmState.lastError = '无审批权限';
    this.crmState.approvalResult = 'failed';
    return;
  }
  
  // 执行驳回
  this.crmState.currentOpportunityApplication.状态 = '已驳回';
  this.crmState.currentOpportunityApplication.审批人 = this.crmState.currentUser.name;
  this.crmState.currentOpportunityApplication.审批时间 = new Date();
  this.crmState.currentOpportunityApplication.驳回原因 = this.crmState.rejectionReason;
  
  // 发送通知给申请人（包含驳回原因）
  this.crmState.notifications = this.crmState.notifications || [];
  this.crmState.notifications.push(
    `商机申请${this.crmState.currentOpportunityApplication.商机编号}已驳回，原因：${this.crmState.rejectionReason}`
  );
  
  this.crmState.approvalResult = 'success';
  console.log('Opportunity application rejected');
});

Then('申请状态更新为 {string}', function (this: CustomWorld, expectedStatus: string) {
  expect(this.crmState.currentOpportunityApplication).to.exist;
  expect(this.crmState.currentOpportunityApplication?.状态).to.equal(expectedStatus);
  
  console.log('Application status updated to:', expectedStatus);
});

Then('通知申请人包含驳回原因', function (this: CustomWorld) {
  expect(this.crmState.notifications).to.be.an('array');
  expect(this.crmState.notifications?.length).to.be.greaterThan(0);
  
  const notification = this.crmState.notifications?.find(n => 
    n.includes(this.crmState.currentOpportunityApplication?.商机编号 || '') &&
    n.includes('已驳回') &&
    n.includes(this.crmState.rejectionReason || '')
  );
  expect(notification).to.exist;
  
  console.log('Applicant notified about rejection with reason');
});

// Rule: 权限校验
Given('销售人员尝试审批商机申请', function (this: CustomWorld) {
  // 设置销售人员用户
  this.crmState.currentUser = {
    id: 'sales_001',
    name: '王销售',
    role: '销售人员',
    isLoggedIn: true
  };
  
  // 确保有商机申请存在
  this.crmState.opportunityApplications = this.crmState.opportunityApplications || [];
  if (this.crmState.opportunityApplications.length === 0) {
    const application = {
      id: 'app_001',
      商机编号: 'OP-005',
      预计签单金额: '500000',
      产品线: 'CRM系统',
      签单概率: '70%',
      状态: '待审批' as '待审批' | '已通过' | '已驳回',
      申请人: '张销售',
      创建时间: new Date()
    };
    this.crmState.opportunityApplications.push(application);
    this.crmState.currentOpportunityApplication = application;
  }
  
  console.log('Sales person attempts to approve opportunity application');
});

// 重用上面的"点击「通过」"步骤

Then('系统提示 {string}', function (this: CustomWorld, expectedMessage: string) {
  expect(this.crmState.lastError).to.equal(expectedMessage);
  expect(this.crmState.approvalResult).to.equal('failed');
  
  console.log('System message verified:', expectedMessage);
}); 