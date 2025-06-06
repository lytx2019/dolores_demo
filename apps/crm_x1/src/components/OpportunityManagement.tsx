'use client';

import React, { useState } from 'react';

interface CRMUser {
  id: string;
  name: string;
  role: '销售人员' | '管理者';
  isLoggedIn: boolean;
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
  关联客户?: string;
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
  customers: any[];
  visitRecords: VisitRecord[];
  opportunities: Opportunity[];
  opportunityApplications: OpportunityApplication[];
  notifications: string[];
}

interface OpportunityManagementProps {
  currentUser: CRMUser;
  crmState: CRMState;
  updateCRMState: (updates: Partial<CRMState>) => void;
}

// 商机阶段配置
const opportunityStageConfigs = [
  { 阶段: '立项评估', 顺序: 1 },
  { 阶段: '方案制定', 顺序: 2 },
  { 阶段: '合同谈判', 顺序: 3 },
  { 阶段: '成交/关闭', 顺序: 4 }
];

const productLineOptions = ['AI 平台', 'CRM系统', '数据分析', '云服务', '其他'];
const probabilityOptions = ['10%', '30%', '50%', '60%', '70%', '80%', '90%'];

export function OpportunityManagement({ currentUser, crmState, updateCRMState }: OpportunityManagementProps) {
  const [activeTab, setActiveTab] = useState<'applications' | 'opportunities'>('applications');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedVisitRecord, setSelectedVisitRecord] = useState<VisitRecord | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    预计签单金额: '',
    产品线: '',
    签单概率: ''
  });
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetApplicationForm = () => {
    setApplicationForm({
      预计签单金额: '',
      产品线: '',
      签单概率: ''
    });
    setErrors({});
    setSelectedVisitRecord(null);
  };

  const validateApplicationForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!applicationForm.预计签单金额 || applicationForm.预计签单金额.trim() === '') {
      newErrors.预计签单金额 = '预计签单金额为必填项';
    } else if (isNaN(Number(applicationForm.预计签单金额))) {
      newErrors.预计签单金额 = '请输入有效的金额';
    }
    
    if (!applicationForm.产品线 || applicationForm.产品线.trim() === '') {
      newErrors.产品线 = '产品线为必填项';
    }
    
    if (!applicationForm.签单概率 || applicationForm.签单概率.trim() === '') {
      newErrors.签单概率 = '签单概率为必填项';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateApplicationForm()) {
      return;
    }

    const newApplication: OpportunityApplication = {
      id: `app_${Date.now()}`,
      商机编号: `OP-${String(Date.now()).slice(-3)}`,
      ...applicationForm,
      状态: '待审批',
      申请人: currentUser.name,
      创建时间: new Date(),
      关联客户: selectedVisitRecord?.客户
    };

    updateCRMState({
      opportunityApplications: [...crmState.opportunityApplications, newApplication],
      notifications: [...crmState.notifications, `商机申请${newApplication.商机编号}已提交，等待审批`]
    });

    setShowApplicationForm(false);
    resetApplicationForm();
  };

  const handleOpportunityStageChange = (opportunity: Opportunity, newStage: string) => {
    const updatedOpportunities = crmState.opportunities.map(opp => {
      if (opp.id === opportunity.id) {
        const oldStage = opp.当前阶段;
        const updatedOpp = {
          ...opp,
          当前阶段: newStage,
          阶段变更历史: opp.阶段变更历史 || []
        };

        updatedOpp.阶段变更历史.push({
          原阶段: oldStage,
          新阶段: newStage,
          变更时间: new Date()
        });

        return updatedOpp;
      }
      return opp;
    });

    updateCRMState({
      opportunities: updatedOpportunities,
      notifications: [...crmState.notifications, `商机${opportunity.商机编号}阶段已更新为${newStage}`]
    });
  };

  const getEligibleVisitRecords = () => {
    return crmState.visitRecords.filter(record => 
      record.销售人员 === currentUser.name && 
      record.客户阶段 === '需求确认'
    );
  };

  const getUserOpportunities = () => {
    if (currentUser.role === '管理者') {
      return crmState.opportunities;
    } else {
      return crmState.opportunities.filter(opp => opp.负责人 === currentUser.name);
    }
  };

  const getUserApplications = () => {
    if (currentUser.role === '管理者') {
      return crmState.opportunityApplications;
    } else {
      return crmState.opportunityApplications.filter(app => app.申请人 === currentUser.name);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            商机管理
          </h2>
          <p className="mt-2 text-gray-600">管理商机申请和跟踪商机进展</p>
        </div>
        {activeTab === 'applications' && (
          <button
            onClick={() => setShowApplicationForm(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium rounded-xl hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新建商机申请
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
              activeTab === 'applications'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/30'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3-7.5H21m-3.75 0L18 9.75 16.5 12 18 14.25L21 12zM9 3.75V12h9.75L21 9.75 18 6.75h-9V3.75z" />
              </svg>
              <span>商机申请</span>
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                {getUserApplications().length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
              activeTab === 'opportunities'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/30'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
              <span>商机列表</span>
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                {getUserOpportunities().length}
              </span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'applications' && (
            <div className="space-y-6">
              {/* Applications Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-100 rounded-2xl p-6 border border-yellow-200/50">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-yellow-700">
                        {getUserApplications().filter(app => app.状态 === '待审批').length}
                      </p>
                      <p className="text-yellow-600 text-sm">待审批</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200/50">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-green-700">
                        {getUserApplications().filter(app => app.状态 === '已通过').length}
                      </p>
                      <p className="text-green-600 text-sm">已通过</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 border border-red-200/50">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-red-700">
                        {getUserApplications().filter(app => app.状态 === '已驳回').length}
                      </p>
                      <p className="text-red-600 text-sm">已驳回</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applications List */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-gray-200/50">
                  <h3 className="text-lg font-semibold text-gray-900">商机申请列表</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {currentUser.role === '管理者' ? '全部申请' : '我的申请'} - 共 {getUserApplications().length} 个
                  </p>
                </div>
                
                {getUserApplications().length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/50">
                        <tr className="border-b border-gray-200/50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">商机编号</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">客户</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">预计金额</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">产品线</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">签单概率</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">申请人</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">申请时间</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/50">
                        {getUserApplications().map((application, index) => (
                          <tr key={application.id} className="hover:bg-yellow-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-medium text-gray-900">{application.商机编号}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{application.关联客户 || '-'}</td>
                            <td className="px-6 py-4 text-gray-600">¥{Number(application.预计签单金额).toLocaleString()}</td>
                            <td className="px-6 py-4 text-gray-600">{application.产品线}</td>
                            <td className="px-6 py-4 text-gray-600">{application.签单概率}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                application.状态 === '待审批' ? 'bg-yellow-100 text-yellow-800' :
                                application.状态 === '已通过' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {application.状态}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{application.申请人}</td>
                            <td className="px-6 py-4 text-gray-600">
                              {application.创建时间 ? new Date(application.创建时间).toLocaleDateString() : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3-7.5H21m-3.75 0L18 9.75 16.5 12 18 14.25L21 12zM9 3.75V12h9.75L21 9.75 18 6.75h-9V3.75z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无商机申请</h3>
                    <p className="text-gray-600 mb-6">开始创建您的第一个商机申请吧</p>
                    <button
                      onClick={() => setShowApplicationForm(true)}
                      className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      新建商机申请
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div className="space-y-6">
              {/* Opportunities Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200/50">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-blue-700">
                        {getUserOpportunities().filter(opp => opp.状态 === '进行中').length}
                      </p>
                      <p className="text-blue-600 text-sm">进行中</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200/50">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.228a25.34 25.34 0 012.916.52 6.003 6.003 0 00-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-green-700">
                        {getUserOpportunities().filter(opp => opp.状态 === '成交').length}
                      </p>
                      <p className="text-green-600 text-sm">已成交</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200/50">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-700">
                        {getUserOpportunities().filter(opp => opp.状态 === '关闭').length}
                      </p>
                      <p className="text-gray-600 text-sm">已关闭</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opportunities List */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-gray-200/50">
                  <h3 className="text-lg font-semibold text-gray-900">商机列表</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {currentUser.role === '管理者' ? '全部商机' : '我的商机'} - 共 {getUserOpportunities().length} 个
                  </p>
                </div>
                
                {getUserOpportunities().length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/50">
                        <tr className="border-b border-gray-200/50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">商机编号</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">客户</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">预计金额</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">当前阶段</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">负责人</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/50">
                        {getUserOpportunities().map((opportunity, index) => (
                          <tr key={opportunity.id} className="hover:bg-yellow-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-medium text-gray-900">{opportunity.商机编号}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{opportunity.客户}</td>
                            <td className="px-6 py-4 text-gray-600">¥{Number(opportunity.预计签单金额).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                opportunity.当前阶段 === '立项评估' ? 'bg-blue-100 text-blue-800' :
                                opportunity.当前阶段 === '方案制定' ? 'bg-yellow-100 text-yellow-800' :
                                opportunity.当前阶段 === '合同谈判' ? 'bg-orange-100 text-orange-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {opportunity.当前阶段}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{opportunity.负责人}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                opportunity.状态 === '进行中' ? 'bg-blue-100 text-blue-800' :
                                opportunity.状态 === '成交' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {opportunity.状态}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {opportunity.负责人 === currentUser.name && opportunity.状态 === '进行中' && (
                                <select
                                  value={opportunity.当前阶段}
                                  onChange={(e) => handleOpportunityStageChange(opportunity, e.target.value)}
                                  className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                >
                                  {opportunityStageConfigs.map(stage => (
                                    <option key={stage.阶段} value={stage.阶段}>
                                      {stage.阶段}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无商机</h3>
                    <p className="text-gray-600 mb-6">商机申请通过后将出现在这里</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">新建商机申请</h3>
                <button
                  onClick={() => {
                    setShowApplicationForm(false);
                    resetApplicationForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleApplicationSubmit} className="space-y-6">
                {/* 基于拜访记录选择 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    基于拜访记录 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedVisitRecord?.id || ''}
                    onChange={(e) => {
                      const record = getEligibleVisitRecords().find(r => r.id === e.target.value);
                      setSelectedVisitRecord(record || null);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  >
                    <option value="">请选择需求确认阶段的拜访记录</option>
                    {getEligibleVisitRecords().map(record => (
                      <option key={record.id} value={record.id}>
                        {record.客户} - {record.拜访日期}
                      </option>
                    ))}
                  </select>
                  {getEligibleVisitRecords().length === 0 && (
                    <p className="mt-2 text-sm text-amber-600">
                      暂无可申请的拜访记录，需要先创建客户阶段为"需求确认"的拜访记录
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 预计签单金额 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      预计签单金额 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={applicationForm.预计签单金额}
                      onChange={(e) => setApplicationForm({ ...applicationForm, 预计签单金额: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="请输入预计签单金额"
                    />
                    {errors.预计签单金额 && (
                      <p className="mt-1 text-sm text-red-600">{errors.预计签单金额}</p>
                    )}
                  </div>

                  {/* 签单概率 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      签单概率 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={applicationForm.签单概率}
                      onChange={(e) => setApplicationForm({ ...applicationForm, 签单概率: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    >
                      <option value="">请选择签单概率</option>
                      {probabilityOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors.签单概率 && (
                      <p className="mt-1 text-sm text-red-600">{errors.签单概率}</p>
                    )}
                  </div>

                  {/* 产品线 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      产品线 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={applicationForm.产品线}
                      onChange={(e) => setApplicationForm({ ...applicationForm, 产品线: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    >
                      <option value="">请选择产品线</option>
                      {productLineOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors.产品线 && (
                      <p className="mt-1 text-sm text-red-600">{errors.产品线}</p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplicationForm(false);
                      resetApplicationForm();
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedVisitRecord}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    提交申请
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 