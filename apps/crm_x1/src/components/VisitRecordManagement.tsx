'use client';

import React, { useState } from 'react';

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

interface CRMState {
  currentUser?: CRMUser;
  customers: Customer[];
  visitRecords: VisitRecord[];
  opportunities: any[];
  opportunityApplications: any[];
  notifications: string[];
}

interface VisitRecordManagementProps {
  currentUser: CRMUser;
  crmState: CRMState;
  updateCRMState: (updates: Partial<CRMState>) => void;
}

// 拜访记录字段配置
const visitRecordFieldConfigs = [
  { 字段: '客户', 类型: '关联', 是否必填: '是' },
  { 字段: '拜访日期', 类型: '日期', 是否必填: '是' },
  { 字段: '客户阶段', 类型: '选项', 是否必填: '是' },
  { 字段: '详细沟通记录', 类型: '文本', 是否必填: '否' }
];

const customerStageOptions = ['初次接触', '需求确认', '方案演示', '意向培养', '合同谈判', '成交'];

export function VisitRecordManagement({ currentUser, crmState, updateCRMState }: VisitRecordManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    客户: '',
    拜访日期: '',
    客户阶段: '',
    详细沟通记录: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      客户: '',
      拜访日期: '',
      客户阶段: '',
      详细沟通记录: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // 检查必填字段
    const requiredFields = visitRecordFieldConfigs
      .filter(config => config.是否必填 === '是')
      .map(config => config.字段);
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData] || formData[field as keyof typeof formData].trim() === '') {
        newErrors[field] = `${field}为必填项`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newVisitRecord: VisitRecord = {
      id: `visit_${Date.now()}`,
      ...formData,
      销售人员: currentUser.name,
      创建时间: new Date()
    };

    updateCRMState({ 
      visitRecords: [...crmState.visitRecords, newVisitRecord],
      notifications: [...crmState.notifications, '拜访记录创建成功']
    });

    setShowCreateForm(false);
    resetForm();
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    resetForm();
  };

  const getDisplayedRecords = () => {
    if (currentUser.role === '管理者') {
      return crmState.visitRecords;
    } else {
      return crmState.visitRecords.filter(record => record.销售人员 === currentUser.name);
    }
  };

  // 获取今天的日期作为默认值
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            拜访记录管理
          </h2>
          <p className="mt-2 text-gray-600">记录和跟踪客户拜访情况</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新建拜访记录
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200/50">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3-7.5H21m-3.75 0L18 9.75 16.5 12 18 14.25L21 12zM9 3.75V12h9.75L21 9.75 18 6.75h-9V3.75z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-blue-700">{getDisplayedRecords().length}</p>
              <p className="text-blue-600 text-sm">总拜访记录</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200/50">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-green-700">
                {getDisplayedRecords().filter(r => r.拜访日期 === new Date().toISOString().split('T')[0]).length}
              </p>
              <p className="text-green-600 text-sm">今日拜访</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-100 rounded-2xl p-6 border border-yellow-200/50">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-yellow-700">
                {new Set(getDisplayedRecords().map(r => r.客户)).size}
              </p>
              <p className="text-yellow-600 text-sm">拜访客户数</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">新建拜访记录</h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 客户选择 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      客户 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.客户}
                      onChange={(e) => setFormData({ ...formData, 客户: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    >
                      <option value="">请选择客户</option>
                      {crmState.customers.map(customer => (
                        <option key={customer.id} value={customer.客户名称}>{customer.客户名称}</option>
                      ))}
                    </select>
                    {errors.客户 && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        {errors.客户}
                      </p>
                    )}
                  </div>

                  {/* 拜访日期 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      拜访日期 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.拜访日期}
                      onChange={(e) => setFormData({ ...formData, 拜访日期: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      max={getTodayDate()}
                    />
                    {errors.拜访日期 && (
                      <p className="mt-1 text-sm text-red-600">{errors.拜访日期}</p>
                    )}
                  </div>

                  {/* 客户阶段 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      客户阶段 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.客户阶段}
                      onChange={(e) => setFormData({ ...formData, 客户阶段: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    >
                      <option value="">请选择客户阶段</option>
                      {customerStageOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors.客户阶段 && (
                      <p className="mt-1 text-sm text-red-600">{errors.客户阶段}</p>
                    )}
                  </div>

                  {/* 详细沟通记录 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">详细沟通记录</label>
                    <textarea
                      value={formData.详细沟通记录}
                      onChange={(e) => setFormData({ ...formData, 详细沟通记录: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                      placeholder="请输入本次拜访的详细沟通记录..."
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    保存记录
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Visit Records List */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">拜访记录列表</h3>
              <p className="mt-1 text-sm text-gray-600">
                {currentUser.role === '管理者' ? '全员拜访记录' : '我的拜访记录'} - 共 {getDisplayedRecords().length} 条
              </p>
            </div>
            {currentUser.role === '管理者' && (
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                管理者视角
              </div>
            )}
          </div>
        </div>
        
        {getDisplayedRecords().length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr className="border-b border-gray-200/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">客户</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">拜访日期</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">客户阶段</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">销售人员</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">沟通记录</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">创建时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {getDisplayedRecords().map((record, index) => (
                  <tr key={record.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="font-medium text-gray-900">{record.客户}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record.拜访日期}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        record.客户阶段 === '初次接触' ? 'bg-gray-100 text-gray-800' :
                        record.客户阶段 === '需求确认' ? 'bg-blue-100 text-blue-800' :
                        record.客户阶段 === '方案演示' ? 'bg-yellow-100 text-yellow-800' :
                        record.客户阶段 === '意向培养' ? 'bg-orange-100 text-orange-800' :
                        record.客户阶段 === '合同谈判' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {record.客户阶段}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record.销售人员}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      <div className="truncate">
                        {record.详细沟通记录 || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {record.创建时间 ? new Date(record.创建时间).toLocaleDateString() : '-'}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无拜访记录</h3>
            <p className="text-gray-600 mb-6">开始记录您的第一次客户拜访吧</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              新建拜访记录
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 