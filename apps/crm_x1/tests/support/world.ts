import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';

// CRM相关接口定义
interface CRMUser {
  id: string;
  name: string;
  role: '销售人员' | '管理者';
  isLoggedIn: boolean;
}

interface CustomerFieldConfig {
  字段: string;
  类型: string;
  是否必填: string;
}

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

interface VisitRecordFieldConfig {
  字段: string;
  类型: string;
  是否必填: string;
}

interface VisitRecord {
  id?: string;
  客户: string;
  拜访日期: string;
  客户阶段: string;
  详细沟通记录?: string;
  销售人员: string;
  创建时间?: Date;
}

interface OpportunityStageConfig {
  阶段: string;
  顺序: number;
}

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

interface ApprovalStatus {
  状态: string;
}

interface ReportConfig {
  报表名: string;
  模板ID: string;
}

export interface ICustomWorld extends World {
  crmState: {
    // 用户相关
    currentUser?: CRMUser;
    currentScreen?: string;
    
    // 客户管理
    customerFieldConfigs?: CustomerFieldConfig[];
    customers?: Customer[];
    currentCustomer?: Customer;
    customerForm?: Record<string, any>;
    customerCountBeforeSave?: number;
    lastModification?: {
      fieldName: string;
      oldValue: string;
      newValue: string;
    };
    
    // 拜访记录管理
    visitRecordFieldConfigs?: VisitRecordFieldConfig[];
    visitRecords?: VisitRecord[];
    currentVisitRecord?: VisitRecord;
    visitRecordForm?: Record<string, any>;
    
    // 商机管理
    opportunityStageConfigs?: OpportunityStageConfig[];
    opportunities?: Opportunity[];
    opportunityApplications?: OpportunityApplication[];
    currentOpportunity?: Opportunity;
    currentOpportunityApplication?: OpportunityApplication;
    
    // 审批流程
    approvalStatuses?: ApprovalStatus[];
    
    // 统计分析
    reportConfigs?: ReportConfig[];
    reportData?: Record<string, any>;
    
    // 通用状态
    lastMessage?: string;
    lastError?: string;
    saveResult?: 'success' | 'failed';
    notifications?: string[];
    
    [key: string]: any;
  };
  appUrl: string;
}

export class CustomWorld extends World implements ICustomWorld {
  public crmState: ICustomWorld['crmState'];
  public appUrl: string;

  constructor(options: IWorldOptions) {
    super(options);
    this.crmState = {};
    this.appUrl = process.env.APP_URL || 'http://localhost:3000';
  }

  resetCRMState() {
    this.crmState = {};
  }

  navigateToScreen(screen: string) {
    this.crmState.currentScreen = screen;
  }
}

setWorldConstructor(CustomWorld); 