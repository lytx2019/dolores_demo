import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';

// 商机阶段配置接口
interface OpportunityStageConfig {
  阶段: string;
  顺序: number;
}

// 商机申请接口
interface OpportunityApplication {
  id?: string;
  商机编号: string;
  预计签单金额: string;
  产品线: string;
  签单概率: string;
  状态: '待审批' | '已通过' | '已驳回';
  申请人: string;
  审批人?: string;
  驳回原因?: string;
  创建时间?: Date;
  审批时间?: Date;
}

// 商机接口
interface Opportunity {
  id?: string;
  商机编号: string;
  客户: string;
  预计签单金额: string;
  当前阶段: string;
  负责人: string;
  状态: '进行中' | '成交' | '关闭';
  阶段变更历史?: Array<{
    原阶段: string;
    新阶段: string;
    变更时间: Date;
  }>;
}

// Background - 商机阶段配置表
Given('系统已定义「商机阶段配置表」:', function (this: CustomWorld, dataTable: DataTable) {
  const rawConfig = dataTable.hashes();
  const stageConfigs: OpportunityStageConfig[] = rawConfig.map(row => ({
    阶段: row['阶段'],
    顺序: parseInt(row['顺序'])
  }));
  
  this.crmState.opportunityStageConfigs = stageConfigs;
  console.log('Opportunity stage configurations loaded:', stageConfigs.length, 'stages');
});

// Rule: 发起转商机申请
Given('销售人员在拜访记录详情页', function (this: CustomWorld) {
  // 设置销售人员用户
  this.crmState.currentUser = {
    id: 'sales_001',
    name: '王销售',
    role: '销售人员',
    isLoggedIn: true
  };
  
  this.crmState.currentScreen = 'visit_record_detail';
  
  // 模拟当前查看的拜访记录
  this.crmState.currentVisitRecord = {
    id: 'visit_001',
    客户: '上海星辰科技',
    拜访日期: '2025-06-10',
    客户阶段: '需求确认',
    销售人员: '王销售',
    创建时间: new Date()
  };
  
  console.log('Sales person is on visit record detail page');
});

When('点击「转商机申请」', function (this: CustomWorld) {
  this.crmState.currentScreen = 'opportunity_application_form';
  this.crmState.opportunityApplicationForm = {
    客户: this.crmState.currentVisitRecord?.客户
  };
  console.log('Opened opportunity application form');
});

When('输入预计签单金额 {string}', function (this: CustomWorld, amount: string) {
  this.crmState.opportunityApplicationForm = this.crmState.opportunityApplicationForm || {};
  this.crmState.opportunityApplicationForm['预计签单金额'] = amount;
  console.log('Entered expected deal amount:', amount);
});

When('选择产品线 {string}', function (this: CustomWorld, productLine: string) {
  this.crmState.opportunityApplicationForm = this.crmState.opportunityApplicationForm || {};
  this.crmState.opportunityApplicationForm['产品线'] = productLine;
  console.log('Selected product line:', productLine);
});

When('选择签单概率 {string}', function (this: CustomWorld, probability: string) {
  this.crmState.opportunityApplicationForm = this.crmState.opportunityApplicationForm || {};
  this.crmState.opportunityApplicationForm['签单概率'] = probability;
  console.log('Selected deal probability:', probability);
});

When('点击「提交」', function (this: CustomWorld) {
  // 创建商机申请
  const newApplication: OpportunityApplication = {
    id: `app_${Date.now()}`,
    商机编号: `OP-${String(Date.now()).slice(-3)}`,
    预计签单金额: this.crmState.opportunityApplicationForm['预计签单金额'],
    产品线: this.crmState.opportunityApplicationForm['产品线'],
    签单概率: this.crmState.opportunityApplicationForm['签单概率'],
    状态: '待审批',
    申请人: this.crmState.currentUser?.name || '未知申请人',
    创建时间: new Date()
  };
  
  this.crmState.opportunityApplications = this.crmState.opportunityApplications || [];
  this.crmState.opportunityApplications.push(newApplication);
  this.crmState.currentOpportunityApplication = newApplication;
  
  // 发送通知给管理者
  this.crmState.notifications = this.crmState.notifications || [];
  this.crmState.notifications.push(`新的商机申请：${newApplication.商机编号}`);
  
  console.log('Opportunity application submitted:', newApplication.商机编号);
});

Then('系统创建状态为 {string} 的商机申请', function (this: CustomWorld, expectedStatus: string) {
  expect(this.crmState.currentOpportunityApplication).to.exist;
  expect(this.crmState.currentOpportunityApplication?.状态).to.equal(expectedStatus);
  
  console.log('Opportunity application created with status:', expectedStatus);
});

Then('通知对应管理者', function (this: CustomWorld) {
  expect(this.crmState.notifications).to.be.an('array');
  expect(this.crmState.notifications?.length).to.be.greaterThan(0);
  
  const notification = this.crmState.notifications?.find(n => 
    n.includes('新的商机申请') && 
    n.includes(this.crmState.currentOpportunityApplication?.商机编号 || '')
  );
  expect(notification).to.exist;
  
  console.log('Manager notified about new opportunity application');
});

// Rule: 维护商机
Given('商机 {string} 当前阶段为 {string}', function (this: CustomWorld, opportunityCode: string, currentStage: string) {
  // 创建商机如果不存在
  this.crmState.opportunities = this.crmState.opportunities || [];
  
  let opportunity = this.crmState.opportunities.find((o: Opportunity) => o.商机编号 === opportunityCode);
  if (!opportunity) {
    opportunity = {
      id: `opp_${Date.now()}`,
      商机编号: opportunityCode,
      客户: '上海星辰科技',
      预计签单金额: '1000000',
      当前阶段: currentStage,
      负责人: '王销售',
      状态: '进行中',
      阶段变更历史: []
    };
    this.crmState.opportunities.push(opportunity);
  }
  
  this.crmState.currentOpportunity = opportunity;
  console.log('Opportunity exists:', opportunityCode, 'current stage:', currentStage);
});

Given('销售人员为该商机负责人', function (this: CustomWorld) {
  // 确保当前用户是销售人员
  this.crmState.currentUser = {
    id: 'sales_001',
    name: '王销售',
    role: '销售人员',
    isLoggedIn: true
  };
  
  // 确保当前商机的负责人是当前用户
  if (this.crmState.currentOpportunity) {
    this.crmState.currentOpportunity.负责人 = this.crmState.currentUser.name;
  }
  
  console.log('Sales person is responsible for the opportunity');
});

When('将阶段修改为 {string}', function (this: CustomWorld, newStage: string) {
  if (!this.crmState.currentOpportunity) {
    throw new Error('No current opportunity selected');
  }
  
  const oldStage = this.crmState.currentOpportunity.当前阶段;
  this.crmState.currentOpportunity.当前阶段 = newStage;
  
  // 记录阶段变更历史
  this.crmState.currentOpportunity.阶段变更历史 = this.crmState.currentOpportunity.阶段变更历史 || [];
  this.crmState.currentOpportunity.阶段变更历史.push({
    原阶段: oldStage,
    新阶段: newStage,
    变更时间: new Date()
  });
  
  this.crmState.lastStageChange = { oldStage, newStage };
  console.log('Opportunity stage changed from', oldStage, 'to', newStage);
});

// 重用客户管理中的"点击「保存」"步骤
When('点击「保存」', function (this: CustomWorld) {
  // 对于商机管理，保存操作总是成功的
  this.crmState.saveResult = 'success';
  this.crmState.lastMessage = '保存成功';
  
  console.log('Opportunity stage change saved');
});

Then('商机阶段应更新为 {string}', function (this: CustomWorld, expectedStage: string) {
  expect(this.crmState.currentOpportunity).to.exist;
  expect(this.crmState.currentOpportunity?.当前阶段).to.equal(expectedStage);
  
  console.log('Opportunity stage updated to:', expectedStage);
});

Then('系统写入阶段变更历史', function (this: CustomWorld) {
  expect(this.crmState.currentOpportunity?.阶段变更历史).to.be.an('array');
  expect(this.crmState.currentOpportunity?.阶段变更历史?.length).to.be.greaterThan(0);
  
  const latestChange = this.crmState.currentOpportunity?.阶段变更历史?.[
    this.crmState.currentOpportunity.阶段变更历史.length - 1
  ];
  expect(latestChange).to.exist;
  expect(latestChange?.新阶段).to.equal(this.crmState.lastStageChange?.newStage);
  
  console.log('Stage change history recorded');
}); 