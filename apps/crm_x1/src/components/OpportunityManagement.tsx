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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">商机管理</h2>
        {currentUser.role === '销售人员' && (
          <button
            onClick={() => setShowApplicationForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            disabled={getEligibleVisitRecords().length === 0}
          >
            转商机申请
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            商机申请
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'opportunities'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            商机列表
          </button>
        </nav>
      </div>

      {/* 转商机申请表单 */}
      {showApplicationForm && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">转商机申请</h3>
          
          <form onSubmit={handleApplicationSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                关联拜访记录 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedVisitRecord?.id || ''}
                onChange={(e) => {
                  const record = getEligibleVisitRecords().find(r => r.id === e.target.value);
                  setSelectedVisitRecord(record || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">请选择拜访记录</option>
                {getEligibleVisitRecords().map(record => (
                  <option key={record.id} value={record.id}>
                    {record.客户} - {record.拜访日期}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  预计签单金额 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={applicationForm.预计签单金额}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, 预计签单金额: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.预计签单金额 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1000000"
                />
                {errors.预计签单金额 && <p className="text-red-500 text-sm mt-1">{errors.预计签单金额}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  产品线 <span className="text-red-500">*</span>
                </label>
                <select
                  value={applicationForm.产品线}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, 产品线: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.产品线 ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">请选择产品线</option>
                  {productLineOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.产品线 && <p className="text-red-500 text-sm mt-1">{errors.产品线}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  签单概率 <span className="text-red-500">*</span>
                </label>
                <select
                  value={applicationForm.签单概率}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, 签单概率: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.签单概率 ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">请选择概率</option>
                  {probabilityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.签单概率 && <p className="text-red-500 text-sm mt-1">{errors.签单概率}</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowApplicationForm(false);
                  resetApplicationForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                提交
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 商机申请列表 */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">商机申请列表</h3>
          </div>
          
          {getUserApplications().length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {currentUser.role === '销售人员' 
                ? '暂无商机申请，先创建需求确认阶段的拜访记录，然后提交转商机申请'
                : '暂无商机申请记录'
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商机编号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">关联客户</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预计金额</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">产品线</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">签单概率</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请人</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请时间</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getUserApplications().map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {application.商机编号}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          application.状态 === '已通过' ? 'bg-green-100 text-green-800' :
                          application.状态 === '已驳回' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {application.状态}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.申请人}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.创建时间?.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 商机列表 */}
      {activeTab === 'opportunities' && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">商机列表</h3>
          </div>
          
          {getUserOpportunities().length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              暂无商机记录
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商机编号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预计金额</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前阶段</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">负责人</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getUserOpportunities().map((opportunity) => (
                    <tr key={opportunity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {opportunity.商机编号}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.客户}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{Number(opportunity.预计签单金额).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={opportunity.当前阶段}
                          onChange={(e) => handleOpportunityStageChange(opportunity, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          disabled={opportunity.负责人 !== currentUser.name}
                        >
                          {opportunityStageConfigs.map(stage => (
                            <option key={stage.阶段} value={stage.阶段}>{stage.阶段}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.负责人}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          opportunity.状态 === '成交' ? 'bg-green-100 text-green-800' :
                          opportunity.状态 === '关闭' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {opportunity.状态}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => {
                            const history = opportunity.阶段变更历史 || [];
                            const historyText = history.map(h => 
                              `${h.原阶段} → ${h.新阶段} (${h.变更时间.toLocaleDateString()})`
                            ).join('\n');
                            alert(`商机详情:\n编号: ${opportunity.商机编号}\n客户: ${opportunity.客户}\n金额: ¥${Number(opportunity.预计签单金额).toLocaleString()}\n当前阶段: ${opportunity.当前阶段}\n\n阶段变更历史:\n${historyText || '无'}`);
                          }}
                        >
                          详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{getUserApplications().length}</div>
          <div className="text-sm text-gray-600">总申请数</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">
            {getUserApplications().filter(app => app.状态 === '待审批').length}
          </div>
          <div className="text-sm text-gray-600">待审批</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {getUserApplications().filter(app => app.状态 === '已通过').length}
          </div>
          <div className="text-sm text-gray-600">已通过</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{getUserOpportunities().length}</div>
          <div className="text-sm text-gray-600">进行中商机</div>
        </div>
      </div>
    </div>
  );
} 