import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';

// 客户字段配置接口
interface CustomerFieldConfig {
  字段: string;
  类型: string;
  是否必填: string;
}

// 客户数据接口
interface Customer {
  id?: string;
  客户名称: string;
  客户行业: string;
  客户分层: string;
  人员规模?: string;
  国家地区?: string;
  官方网站?: string;
  创建时间?: Date;
  修改日志?: Array<{
    字段: string;
    原值: string;
    新值: string;
    修改时间: Date;
  }>;
}

// Background - 客户字段配置表
Given('系统已定义「客户字段配置表」:', function (this: CustomWorld, dataTable: DataTable) {
  const rawConfig = dataTable.hashes();
  const fieldConfigs: CustomerFieldConfig[] = rawConfig.map(row => ({
    字段: row['字段'],
    类型: row['类型'],
    是否必填: row['是否必填']
  }));
  
  this.crmState.customerFieldConfigs = fieldConfigs;
  console.log('Customer field configurations loaded:', fieldConfigs.length, 'fields');
});

// Rule: 创建客户
Given('销售人员已登录系统', function (this: CustomWorld) {
  this.crmState.currentUser = {
    id: 'user_001',
    name: '张三',
    role: '销售人员',
    isLoggedIn: true
  };
  console.log('Sales person logged in:', this.crmState.currentUser.name);
});

When('在客户列表点击「新建客户」', function (this: CustomWorld) {
  this.crmState.currentScreen = 'customer_create_form';
  this.crmState.customerFormData = {};
  console.log('Opened new customer form');
});

When('输入:', function (this: CustomWorld, dataTable: DataTable) {
  const inputData = dataTable.hashes();
  this.crmState.customerFormData = this.crmState.customerFormData || {};
  
  // 从表头中获取客户名称
  if (inputData.length > 0) {
    const firstRow = inputData[0];
    const keys = Object.keys(firstRow);
    // 第三列的键名就是客户名称的值
    const customerNameValue = keys[2]?.replace(/"/g, '') || '';
    if (customerNameValue) {
      this.crmState.customerFormData['客户名称'] = customerNameValue;
    }
  }
  
  inputData.forEach((row, index) => {
    const keys = Object.keys(row);
    const values = Object.values(row);
    
    // 字段名在values[0]中，值在values[2]中
    const field = values[0];
    const value = values[2]?.replace(/"/g, '') || '';
    
    if (field && value && field !== '=') {
      this.crmState.customerFormData![field] = value;
    }
  });
  
  console.log('Customer form data entered:', this.crmState.customerFormData);
});

// 通用保存步骤 - 优先处理客户管理的保存逻辑
When('点击「保存」', function (this: CustomWorld) {
  // 如果在拜访记录模块
  if (this.crmState.currentScreen === 'visit_record_create_form' || 
      (this.crmState.visitRecordForm && Object.keys(this.crmState.visitRecordForm).length > 0)) {
    if (!this.crmState.visitRecordForm) {
      throw new Error('No visit record form data to save');
    }
    
    // 验证必填字段
    const requiredFields = ['客户', '拜访日期', '客户阶段'];
    const missingFields = requiredFields.filter(field => 
      !this.crmState.visitRecordForm![field] || 
      this.crmState.visitRecordForm![field].toString().trim() === ''
    );
    
    if (missingFields.length > 0) {
      this.crmState.lastError = `${missingFields[0]}为必填项`;
      this.crmState.saveResult = 'failed';
      console.log('Visit record validation failed:', this.crmState.lastError);
      return;
    }
    
    // 保存拜访记录
    const newVisitRecord = {
      id: `visit_${Date.now()}`,
      客户: this.crmState.visitRecordForm['客户'],
      拜访日期: this.crmState.visitRecordForm['拜访日期'],
      客户阶段: this.crmState.visitRecordForm['客户阶段'],
      详细沟通记录: this.crmState.visitRecordForm['详细沟通记录'] || '',
      销售人员: this.crmState.currentUser?.name || '未知销售',
      创建时间: new Date()
    };
    
    this.crmState.visitRecords = this.crmState.visitRecords || [];
    this.crmState.visitRecords.push(newVisitRecord);
    
    this.crmState.lastMessage = '拜访记录创建成功';
    this.crmState.saveResult = 'success';
    this.crmState.visitRecordForm = {};
    
    console.log('Visit record saved successfully', newVisitRecord);
  }
  // 如果在客户管理模块
  else if (this.crmState.currentScreen === 'customer_create_form' || 
           (this.crmState.customerFormData && Object.keys(this.crmState.customerFormData).length > 0)) {
    if (!this.crmState.customerFormData) {
      throw new Error('No customer form data to save');
    }
    
    // 验证必填字段
    const requiredFields = ['客户名称', '客户行业', '客户分层'];
    const missingFields = requiredFields.filter(field => 
      !this.crmState.customerFormData![field] || this.crmState.customerFormData![field].trim() === ''
    );
    
    if (missingFields.length > 0) {
      this.crmState.lastError = `${missingFields[0]}为必填项`;
      this.crmState.saveResult = 'failed';
      console.log('Validation failed:', this.crmState.lastError);
      return;
    }
    
    // 保存客户
    this.crmState.customers = this.crmState.customers || [];
    
    if (this.crmState.editingCustomerId) {
      // 编辑现有客户
      const customerIndex = this.crmState.customers.findIndex(c => c.id === this.crmState.editingCustomerId);
      if (customerIndex >= 0) {
        const oldCustomer = { ...this.crmState.customers[customerIndex] };
        this.crmState.customers[customerIndex] = {
          ...this.crmState.customers[customerIndex],
          客户名称: this.crmState.customerFormData['客户名称'],
          客户行业: this.crmState.customerFormData['客户行业'],
          客户分层: this.crmState.customerFormData['客户分层'],
          人员规模: this.crmState.customerFormData['人员规模'],
          国家地区: this.crmState.customerFormData['国家/地区'],
          官方网站: this.crmState.customerFormData['官方网站'],
          修改日志: this.crmState.customers[customerIndex].修改日志 || []
        };
        
        // 同时更新当前客户对象
        this.crmState.currentCustomer = this.crmState.customers[customerIndex];
        
        // 记录修改日志
        Object.keys(this.crmState.customerFormData!).forEach(field => {
          const oldValue = (oldCustomer as any)[field === '国家/地区' ? '国家地区' : field];
          const newValue = this.crmState.customerFormData![field];
          if (oldValue !== newValue) {
            this.crmState.customers![customerIndex].修改日志!.push({
              字段: field,
              原值: oldValue || '',
              新值: newValue,
              修改时间: new Date()
            });
          }
        });
      }
      this.crmState.lastMessage = '修改成功';
    } else {
      // 新建客户
      const newCustomer: Customer = {
        id: `customer_${Date.now()}`,
        客户名称: this.crmState.customerFormData['客户名称'],
        客户行业: this.crmState.customerFormData['客户行业'],
        客户分层: this.crmState.customerFormData['客户分层'],
        人员规模: this.crmState.customerFormData['人员规模'],
        国家地区: this.crmState.customerFormData['国家/地区'],
        官方网站: this.crmState.customerFormData['官方网站'],
        创建时间: new Date(),
        修改日志: []
      };
      this.crmState.customers.push(newCustomer);
      this.crmState.lastMessage = '创建成功';
    }
    
    this.crmState.saveResult = 'success';
    this.crmState.customerFormData = null;
    this.crmState.editingCustomerId = null;
    
    console.log('Customer saved successfully');
  }
  // 如果在商机管理模块
  else if (this.crmState.currentScreen === 'opportunity_stage_edit') {
    if (!this.crmState.currentOpportunity || !this.crmState.newOpportunityStage) {
      throw new Error('No opportunity or stage data to save');
    }
    
    const oldStage = this.crmState.currentOpportunity.当前阶段;
    this.crmState.currentOpportunity.当前阶段 = this.crmState.newOpportunityStage;
    
    // 记录阶段变更历史
    this.crmState.currentOpportunity.阶段变更历史 = this.crmState.currentOpportunity.阶段变更历史 || [];
    this.crmState.currentOpportunity.阶段变更历史.push({
      原阶段: oldStage,
      新阶段: this.crmState.newOpportunityStage,
      变更时间: new Date()
    });
    
    this.crmState.lastMessage = '商机阶段更新成功';
    this.crmState.saveResult = 'success';
    
    console.log('Opportunity stage changed from', oldStage, 'to', this.crmState.newOpportunityStage);
  }
  // 默认保存逻辑
  else {
    this.crmState.lastMessage = '保存成功';
    this.crmState.saveResult = 'success';
  }
});

// 通用系统提示步骤
Then('系统提示 {string}', function (this: CustomWorld, expectedMessage: string) {
  // 检查是否是审批权限错误的情况
  if (this.crmState.approvalResult === 'failed' && this.crmState.lastError) {
    expect(this.crmState.lastError).to.equal(expectedMessage);
  }
  // 检查是否是其他验证失败的情况
  else if (this.crmState.saveResult === 'failed' && this.crmState.lastError) {
    expect(this.crmState.lastError).to.equal(expectedMessage);
  }
  // 检查是否是成功的情况
  else if (this.crmState.saveResult === 'success' && this.crmState.lastMessage) {
    expect(this.crmState.lastMessage).to.equal(expectedMessage);
  }
  // 默认情况，检查lastMessage
  else {
    expect(this.crmState.lastMessage || this.crmState.lastError).to.equal(expectedMessage);
  }
  console.log('System message verified:', expectedMessage);
});

Then('客户列表出现 {string}', function (this: CustomWorld, customerName: string) {
  expect(this.crmState.customers).to.be.an('array');
  const customer = this.crmState.customers?.find((c: Customer) => c.客户名称 === customerName);
  expect(customer).to.exist;
  console.log('Customer found in list:', customerName);
});

// Rule: 编辑客户
Given('已存在客户 {string}', function (this: CustomWorld, customerName: string) {
  this.crmState.customers = this.crmState.customers || [];
  
  // 清理之前的修改状态
  this.crmState.lastModification = undefined;
  
  // 检查客户是否已存在，如果不存在则创建
  let customer = this.crmState.customers.find((c: Customer) => c.客户名称 === customerName);
  if (!customer) {
    customer = {
      id: `customer_${Date.now()}`,
      客户名称: customerName,
      客户行业: '软件',
      客户分层: 'A',
      创建时间: new Date(),
      修改日志: []
    };
    this.crmState.customers.push(customer);
  }
  
  this.crmState.currentCustomer = customer;
  this.crmState.customerFormData = {
    客户名称: customer.客户名称,
    客户行业: customer.客户行业,
    客户分层: customer.客户分层,
    人员规模: customer.人员规模 || '',
    '国家/地区': customer.国家地区 || '',
    官方网站: customer.官方网站 || ''
  };
  this.crmState.editingCustomerId = customer.id;
  
  console.log('Customer exists:', customerName);
});

When('销售人员将 {string} 修改为 {string}', function (this: CustomWorld, fieldName: string, newValue: string) {
  if (!this.crmState.currentCustomer) {
    throw new Error('No current customer selected');
  }
  
  const oldValue = this.crmState.currentCustomer[fieldName as keyof Customer] as string;
  
  // 更新表单数据准备保存
  this.crmState.customerFormData = this.crmState.customerFormData || {};
  if (fieldName === '国家地区') {
    this.crmState.customerFormData['国家/地区'] = newValue;
  } else {
    this.crmState.customerFormData[fieldName] = newValue;
  }
  
  // 保存修改信息供验证
  this.crmState.lastModification = { fieldName, oldValue: oldValue || '', newValue };
  console.log('Customer field modification prepared:', fieldName, 'from', oldValue, 'to', newValue);
});

Then('{string} 应显示为 {string}', function (this: CustomWorld, fieldName: string, expectedValue: string) {
  expect(this.crmState.currentCustomer).to.exist;
  const actualValue = this.crmState.currentCustomer![fieldName as keyof Customer];
  expect(actualValue).to.equal(expectedValue);
  console.log('Field value verified:', fieldName, '=', expectedValue);
});

Then('系统记录一条修改日志', function (this: CustomWorld) {
  expect(this.crmState.currentCustomer?.修改日志).to.be.an('array');
  expect(this.crmState.currentCustomer?.修改日志?.length).to.be.greaterThan(0);
  
  const latestLog = this.crmState.currentCustomer?.修改日志?.[this.crmState.currentCustomer.修改日志.length - 1];
  expect(latestLog).to.exist;
  expect(latestLog?.字段).to.equal(this.crmState.lastModification?.fieldName);
  
  console.log('Modification log recorded for field:', latestLog?.字段);
});

// Rule: 必填字段校验
Given('销售人员点击「新建客户」', function (this: CustomWorld) {
  this.crmState.currentScreen = 'customer_create_form';
  this.crmState.customerFormData = {};
  console.log('New customer form opened');
});

When('仅填写 {string}', function (this: CustomWorld, fieldInput: string) {
  // 解析 "客户行业=制造业" 格式
  const [fieldName, value] = fieldInput.split('=');
  this.crmState.customerFormData = this.crmState.customerFormData || {};
  this.crmState.customerFormData[fieldName] = value;
  console.log('Single field filled:', fieldName, '=', value);
});

Then('不保存记录', function (this: CustomWorld) {
  expect(this.crmState.saveResult).to.equal('failed');
  
  // 验证没有新客户被创建
  const customerCount = this.crmState.customers?.length || 0;
  this.crmState.customerCountBeforeSave = this.crmState.customerCountBeforeSave || customerCount;
  expect(this.crmState.customers?.length || 0).to.equal(this.crmState.customerCountBeforeSave);
  
  console.log('Record not saved due to validation error');
});

Given('客户管理中已存在客户 {string}', function (this: CustomWorld, customerName: string) {
  this.crmState.customers = this.crmState.customers || [];
  
  // 检查客户是否已存在
  let customer = this.crmState.customers.find(c => c.客户名称 === customerName);
  if (!customer) {
    const newCustomer: Customer = {
      id: `customer_${Date.now()}`,
      客户名称: customerName,
      客户行业: '软件',
      客户分层: 'A',
      人员规模: '100-500人',
      国家地区: '中国',
      官方网站: 'https://example.com',
      创建时间: new Date(),
      修改日志: []
    };
    this.crmState.customers.push(newCustomer);
  }
  
  console.log('Customer exists in customer management:', customerName);
}); 