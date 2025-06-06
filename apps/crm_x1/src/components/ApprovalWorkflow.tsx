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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">审批流程</h2>
        <div className="text-sm text-gray-600">
          当前权限: {currentUser.role}
        </div>
      </div>

      {!canApprove && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                您当前是销售人员角色，无法进行审批操作。请联系管理者进行审批。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 待审批申请 */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            待审批申请 
            <span className="ml-2 text-sm text-gray-600">
              ({getPendingApplications().length} 条)
            </span>
          </h3>
        </div>
        
        {getPendingApplications().length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            暂无待审批的商机申请
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商机编号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">关联客户</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预计金额</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">产品线</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">签单概率</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getPendingApplications().map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {application.商机编号}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.申请人}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.关联客户 || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{Number(application.预计签单金额).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.产品线}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.签单概率}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.创建时间?.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {canApprove ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(application)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => openRejectionModal(application)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                          >
                            驳回
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">无权限</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 已处理申请 */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            已处理申请
            <span className="ml-2 text-sm text-gray-600">
              ({getProcessedApplications().length} 条)
            </span>
          </h3>
        </div>
        
        {getProcessedApplications().length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            暂无已处理的申请记录
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商机编号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预计金额</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">审批状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">审批人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">审批时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">备注</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getProcessedApplications().map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {application.商机编号}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.申请人}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{Number(application.预计签单金额).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        application.状态 === '已通过' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {application.状态}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.审批人 || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.审批时间?.toLocaleDateString() || '-'}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-sm text-gray-900 truncate">
                        {application.驳回原因 || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {crmState.opportunityApplications.length}
          </div>
          <div className="text-sm text-gray-600">总申请数</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">
            {getPendingApplications().length}
          </div>
          <div className="text-sm text-gray-600">待审批</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {crmState.opportunityApplications.filter(app => app.状态 === '已通过').length}
          </div>
          <div className="text-sm text-gray-600">已通过</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-red-600">
            {crmState.opportunityApplications.filter(app => app.状态 === '已驳回').length}
          </div>
          <div className="text-sm text-gray-600">已驳回</div>
        </div>
      </div>

      {/* 驳回原因模态框 */}
      {showRejectionModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                驳回申请: {selectedApplication.商机编号}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  驳回原因 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="请输入驳回原因..."
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeRejectionModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (rejectionReason.trim()) {
                      handleReject(selectedApplication, rejectionReason);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  disabled={!rejectionReason.trim()}
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