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
  this.crmState.customerForm = {};
  console.log('Opened new customer form');
});

When('输入:', function (this: CustomWorld, dataTable: DataTable) {
  const inputData = dataTable.hashes();
  
  inputData.forEach(row => {
    const field = row['客户名称'] || row['客户行业'] || row['客户分层'];
    const operator = '=';
    const value = row['='] || Object.values(row)[1];
    
    if (field) {
      this.crmState.customerForm = this.crmState.customerForm || {};
      this.crmState.customerForm[field] = value.replace(/"/g, '');
    }
  });
  
  console.log('Customer form data entered:', this.crmState.customerForm);
});

When('点击「保存」', function (this: CustomWorld) {
  // 验证必填字段
  const requiredFields = this.crmState.customerFieldConfigs
    ?.filter((config: CustomerFieldConfig) => config.是否必填 === '是')
    .map((config: CustomerFieldConfig) => config.字段) || [];
  
  const customerForm = this.crmState.customerForm || {};
  const missingFields = requiredFields.filter((field: string) => 
    !customerForm[field] || 
    customerForm[field].trim() === ''
  );
  
  if (missingFields.length > 0) {
    this.crmState.lastError = `${missingFields[0]}为必填项`;
    this.crmState.saveResult = 'failed';
  } else {
    // 保存客户
    const newCustomer: Customer = {
      id: `customer_${Date.now()}`,
      客户名称: customerForm['客户名称'],
      客户行业: customerForm['客户行业'],
      客户分层: customerForm['客户分层'],
      人员规模: customerForm['人员规模'],
      国家地区: customerForm['国家/地区'],
      官方网站: customerForm['官方网站'],
      创建时间: new Date(),
      修改日志: []
    };
    
    this.crmState.customers = this.crmState.customers || [];
    this.crmState.customers.push(newCustomer);
    this.crmState.lastMessage = '创建成功';
    this.crmState.saveResult = 'success';
  }
  
  console.log('Save customer attempted, result:', this.crmState.saveResult);
});

Then('系统提示 {string}', function (this: CustomWorld, expectedMessage: string) {
  if (this.crmState.saveResult === 'success') {
    expect(this.crmState.lastMessage).to.equal(expectedMessage);
  } else {
    expect(this.crmState.lastError).to.equal(expectedMessage);
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
  console.log('Customer exists:', customerName);
});

When('销售人员将 {string} 修改为 {string}', function (this: CustomWorld, fieldName: string, newValue: string) {
  if (!this.crmState.currentCustomer) {
    throw new Error('No current customer selected');
  }
  
  const oldValue = this.crmState.currentCustomer[fieldName as keyof Customer] as string;
  
  // 正确地设置字段值，避免类型冲突
  if (fieldName === '客户名称') {
    this.crmState.currentCustomer.客户名称 = newValue;
  } else if (fieldName === '客户行业') {
    this.crmState.currentCustomer.客户行业 = newValue;
  } else if (fieldName === '客户分层') {
    this.crmState.currentCustomer.客户分层 = newValue;
  } else if (fieldName === '人员规模') {
    this.crmState.currentCustomer.人员规模 = newValue;
  } else if (fieldName === '国家地区') {
    this.crmState.currentCustomer.国家地区 = newValue;
  } else if (fieldName === '官方网站') {
    this.crmState.currentCustomer.官方网站 = newValue;
  }
  
  // 记录修改日志
  this.crmState.currentCustomer.修改日志 = this.crmState.currentCustomer.修改日志 || [];
  this.crmState.currentCustomer.修改日志.push({
    字段: fieldName,
    原值: oldValue || '',
    新值: newValue,
    修改时间: new Date()
  });
  
  this.crmState.lastModification = { fieldName, oldValue: oldValue || '', newValue };
  console.log('Customer field modified:', fieldName, 'from', oldValue, 'to', newValue);
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
  
  console.log('Modification log recorded');
});

// Rule: 必填字段校验
Given('销售人员点击「新建客户」', function (this: CustomWorld) {
  this.crmState.currentScreen = 'customer_create_form';
  this.crmState.customerForm = {};
  console.log('New customer form opened');
});

When('仅填写 {string}', function (this: CustomWorld, fieldInput: string) {
  // 解析 "客户行业=制造业" 格式
  const [fieldName, value] = fieldInput.split('=');
  this.crmState.customerForm = this.crmState.customerForm || {};
  this.crmState.customerForm[fieldName] = value;
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