'use client';

import React, { useState } from 'react';

interface CRMUser {
  id: string;
  name: string;
  role: '销售人员' | '管理者';
  isLoggedIn: boolean;
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
  visitRecords: any[];
  opportunities: Opportunity[];
  opportunityApplications: OpportunityApplication[];
  notifications: string[];
}

interface ApprovalWorkflowProps {
  currentUser: CRMUser;
  crmState: CRMState;
  updateCRMState: (updates: Partial<CRMState>) => void;
}

// 审批状态枚举
const approvalStatuses = [
  { 状态: '待审批' },
  { 状态: '已通过' },
  { 状态: '已驳回' }
];

export function ApprovalWorkflow({ currentUser, crmState, updateCRMState }: ApprovalWorkflowProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<OpportunityApplication | null>(null);

  const handleApprove = (application: OpportunityApplication) => {
    if (currentUser.role !== '管理者') {
      updateCRMState({
        notifications: [...crmState.notifications, '无审批权限']
      });
      return;
    }

    // 更新申请状态
    const updatedApplications = crmState.opportunityApplications.map(app => {
      if (app.id === application.id) {
        return {
          ...app,
          状态: '已通过' as const,
          审批人: currentUser.name,
          审批时间: new Date()
        };
      }
      return app;
    });

    // 创建对应的商机
    const newOpportunity: Opportunity = {
      id: `opp_${Date.now()}`,
      商机编号: application.商机编号,
      客户: application.关联客户 || '未知客户',
      预计签单金额: application.预计签单金额,
      当前阶段: '立项评估',
      负责人: application.申请人,
      状态: '进行中',
      阶段变更历史: []
    };

    updateCRMState({
      opportunityApplications: updatedApplications,
      opportunities: [...crmState.opportunities, newOpportunity],
      notifications: [...crmState.notifications, `商机申请${application.商机编号}已通过审批`]
    });
  };

  const handleReject = (application: OpportunityApplication, reason: string) => {
    if (currentUser.role !== '管理者') {
      updateCRMState({
        notifications: [...crmState.notifications, '无审批权限']
      });
      return;
    }

    const updatedApplications = crmState.opportunityApplications.map(app => {
      if (app.id === application.id) {
        return {
          ...app,
          状态: '已驳回' as const,
          审批人: currentUser.name,
          审批时间: new Date(),
          驳回原因: reason
        };
      }
      return app;
    });

    updateCRMState({
      opportunityApplications: updatedApplications,
      notifications: [...crmState.notifications, `商机申请${application.商机编号}已驳回，原因：${reason}`]
    });

    setShowRejectionModal(false);
    setRejectionReason('');
    setSelectedApplication(null);
  };

  const openRejectionModal = (application: OpportunityApplication) => {
    setSelectedApplication(application);
    setShowRejectionModal(true);
  };

  const closeRejectionModal = () => {
    setShowRejectionModal(false);
    setRejectionReason('');
    setSelectedApplication(null);
  };

  const getPendingApplications = () => {
    return crmState.opportunityApplications.filter(app => app.状态 === '待审批');
  };

  const getProcessedApplications = () => {
    return crmState.opportunityApplications.filter(app => app.状态 !== '待审批');
  };

  const canApprove = currentUser.role === '管理者';

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
            审批流程
          </h2>
          <p className="mt-2 text-gray-600">商机申请的审批和管理</p>
        </div>
        <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
          <div className={`w-2 h-2 rounded-full ${
            currentUser.role === '管理者' ? 'bg-green-500' : 'bg-blue-500'
          }`}></div>
          <span className="text-sm font-medium text-gray-700">当前权限: {currentUser.role}</span>
        </div>
      </div>

      {/* Permission Warning */}
      {!canApprove && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-100 border-l-4 border-amber-400 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-6.75 1.5h13.5M12 15h.008v.008H12V15zm0 2.25h.008v.008H12V17.25zm6.72-9.35l1.888 1.888M12 6.75V4.5m-6.72 2.25L3.39 8.64" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-amber-800 font-medium">权限提示</p>
              <p className="text-amber-700 text-sm mt-1">
                您当前是销售人员角色，无法进行审批操作。请联系管理者进行审批。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-100 rounded-2xl p-6 border border-yellow-200/50">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-yellow-700">{getPendingApplications().length}</p>
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
                {crmState.opportunityApplications.filter(app => app.状态 === '已通过').length}
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
                {crmState.opportunityApplications.filter(app => app.状态 === '已驳回').length}
              </p>
              <p className="text-red-600 text-sm">已驳回</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Applications */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">待审批申请</h3>
              <p className="mt-1 text-sm text-gray-600">共 {getPendingApplications().length} 条待审批申请</p>
            </div>
            {canApprove && getPendingApplications().length > 0 && (
              <div className="flex items-center text-sm text-green-600">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                可以审批
              </div>
            )}
          </div>
        </div>
        
        {getPendingApplications().length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr className="border-b border-gray-200/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">商机编号</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">申请人</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">关联客户</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">预计金额</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">产品线</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">签单概率</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">申请时间</th>
                  {canApprove && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {getPendingApplications().map((application, index) => (
                  <tr key={application.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{application.商机编号}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{application.申请人}</td>
                    <td className="px-6 py-4 text-gray-600">{application.关联客户 || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">¥{Number(application.预计签单金额).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{application.产品线}</td>
                    <td className="px-6 py-4 text-gray-600">{application.签单概率}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {application.创建时间 ? new Date(application.创建时间).toLocaleDateString() : '-'}
                    </td>
                    {canApprove && (
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(application)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            通过
                          </button>
                          <button
                            onClick={() => openRejectionModal(application)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            驳回
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无待审批申请</h3>
            <p className="text-gray-600">所有商机申请都已处理完成</p>
          </div>
        )}
      </div>

      {/* Processed Applications */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900">已处理申请</h3>
          <p className="mt-1 text-sm text-gray-600">共 {getProcessedApplications().length} 条已处理申请</p>
        </div>
        
        {getProcessedApplications().length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr className="border-b border-gray-200/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">商机编号</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">申请人</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">预计金额</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">审批人</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">审批时间</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">驳回原因</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {getProcessedApplications().map((application, index) => (
                  <tr key={application.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{application.商机编号}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{application.申请人}</td>
                    <td className="px-6 py-4 text-gray-600">¥{Number(application.预计签单金额).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        application.状态 === '已通过' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {application.状态}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{application.审批人 || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {application.审批时间 ? new Date(application.审批时间).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      <div className="truncate">
                        {application.驳回原因 || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无已处理申请</h3>
            <p className="text-gray-600">处理过的申请将在这里显示</p>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">驳回申请</h3>
                <button
                  onClick={closeRejectionModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">申请编号: {selectedApplication.商机编号}</p>
                <p className="text-sm text-gray-600">申请人: {selectedApplication.申请人}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  驳回原因 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="请输入驳回原因..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeRejectionModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleReject(selectedApplication, rejectionReason)}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认驳回
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 