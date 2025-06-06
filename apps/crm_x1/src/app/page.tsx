'use client';

import React, { useState, useEffect } from 'react';
import { CustomerManagement } from '../components/CustomerManagement';
import { VisitRecordManagement } from '../components/VisitRecordManagement';
import { OpportunityManagement } from '../components/OpportunityManagement';
import { ApprovalWorkflow } from '../components/ApprovalWorkflow';
import { StatisticalAnalysis } from '../components/StatisticalAnalysis';

// CRM State Management
interface CRMUser {
  id: string;
  name: string;
  role: '销售人员' | '管理者';
  isLoggedIn: boolean;
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

interface VisitRecord {
  id?: string;
  客户: string;
  拜访日期: string;
  客户阶段: string;
  详细沟通记录?: string;
  销售人员: string;
  创建时间?: Date;
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

interface CRMState {
  currentUser?: CRMUser;
  customers: Customer[];
  visitRecords: VisitRecord[];
  opportunities: Opportunity[];
  opportunityApplications: OpportunityApplication[];
  notifications: string[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('customer');
  const [currentUser, setCurrentUser] = useState<CRMUser | null>(null);
  const [crmState, setCRMState] = useState<CRMState>({
    customers: [],
    visitRecords: [],
    opportunities: [],
    opportunityApplications: [],
    notifications: []
  });

  // 初始化用户登录
  useEffect(() => {
    const user: CRMUser = {
      id: 'user_001',
      name: '张三',
      role: '销售人员',
      isLoggedIn: true
    };
    setCurrentUser(user);
    setCRMState(prev => ({ ...prev, currentUser: user }));
  }, []);

  const tabs = [
    { id: 'customer', name: '客户管理', icon: '👥' },
    { id: 'visit', name: '拜访记录', icon: '🤝' },
    { id: 'opportunity', name: '商机管理', icon: '💼' },
    { id: 'approval', name: '审批流程', icon: '✅' },
    { id: 'analysis', name: '统计分析', icon: '📊' }
  ];

  const updateCRMState = (updates: Partial<CRMState>) => {
    setCRMState(prev => ({ ...prev, ...updates }));
  };

  const switchUser = () => {
    const newUser: CRMUser = currentUser?.role === '销售人员' 
      ? { id: 'manager_001', name: '李管理', role: '管理者', isLoggedIn: true }
      : { id: 'user_001', name: '张三', role: '销售人员', isLoggedIn: true };
    
    setCurrentUser(newUser);
    setCRMState(prev => ({ ...prev, currentUser: newUser }));
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">CRM X1</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">当前用户:</span>
                <span className="text-sm font-medium text-gray-900">{currentUser.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  currentUser.role === '管理者' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={switchUser}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                切换角色
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {crmState.notifications.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  {crmState.notifications[crmState.notifications.length - 1]}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'customer' && (
              <CustomerManagement 
                currentUser={currentUser} 
                crmState={crmState}
                updateCRMState={updateCRMState}
              />
            )}
            {activeTab === 'visit' && (
              <VisitRecordManagement 
                currentUser={currentUser} 
                crmState={crmState}
                updateCRMState={updateCRMState}
              />
            )}
            {activeTab === 'opportunity' && (
              <OpportunityManagement 
                currentUser={currentUser} 
                crmState={crmState}
                updateCRMState={updateCRMState}
              />
            )}
            {activeTab === 'approval' && (
              <ApprovalWorkflow 
                currentUser={currentUser} 
                crmState={crmState}
                updateCRMState={updateCRMState}
              />
            )}
            {activeTab === 'analysis' && (
              <StatisticalAnalysis 
                currentUser={currentUser} 
                crmState={crmState}
                updateCRMState={updateCRMState}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 