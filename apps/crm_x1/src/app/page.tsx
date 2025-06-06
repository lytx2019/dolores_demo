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
    { id: 'customer', name: '客户管理', icon: '👥', color: 'blue' },
    { id: 'visit', name: '拜访记录', icon: '🤝', color: 'green' },
    { id: 'opportunity', name: '商机管理', icon: '💼', color: 'yellow' },
    { id: 'approval', name: '审批流程', icon: '✅', color: 'purple' },
    { id: 'analysis', name: '统计分析', icon: '📊', color: 'indigo' }
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <div className="mt-4 text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header with Glassmorphism Effect */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  CRM X1
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Info Card */}
              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    currentUser.role === '管理者' ? 'bg-purple-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  currentUser.role === '管理者' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              
              {/* Switch Role Button */}
              <button
                onClick={switchUser}
                className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-all duration-300 hover:shadow-md border border-gray-200/50"
              >
                <span className="relative z-10">切换角色</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Notifications */}
      {crmState.notifications.length > 0 && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10"></div>
          <div className="relative bg-white/70 backdrop-blur-sm border-l-4 border-blue-500 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 text-blue-500">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    {crmState.notifications[crmState.notifications.length - 1]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Tab Navigation with Glassmorphism */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="border-b border-gray-200/50">
            <nav className="flex">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 py-4 px-6 font-medium text-sm transition-all duration-300 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/30'
                    }`}
                  >
                    {/* Active Tab Background */}
                    {isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${
                        tab.color === 'blue' ? 'from-blue-500 to-blue-600' :
                        tab.color === 'green' ? 'from-green-500 to-green-600' :
                        tab.color === 'yellow' ? 'from-yellow-500 to-orange-500' :
                        tab.color === 'purple' ? 'from-purple-500 to-purple-600' :
                        'from-indigo-500 to-indigo-600'
                      } shadow-lg`}></div>
                    )}
                    
                    {/* Tab Content */}
                    <div className="relative z-10 flex items-center justify-center space-x-2">
                      <span className="text-lg">{tab.icon}</span>
                      <span>{tab.name}</span>
                    </div>
                    
                    {/* Hover Effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content with Enhanced Styling */}
          <div className="p-8 min-h-[600px]">
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