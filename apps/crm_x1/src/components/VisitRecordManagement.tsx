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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">拜访记录管理</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          新建拜访记录
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">新建拜访记录</h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                客户 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.客户}
                onChange={(e) => setFormData(prev => ({ ...prev, 客户: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.客户 ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">请选择客户</option>
                {crmState.customers.map(customer => (
                  <option key={customer.id} value={customer.客户名称}>{customer.客户名称}</option>
                ))}
              </select>
              {errors.客户 && <p className="text-red-500 text-sm mt-1">{errors.客户}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                拜访日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.拜访日期}
                onChange={(e) => setFormData(prev => ({ ...prev, 拜访日期: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.拜访日期 ? 'border-red-500' : 'border-gray-300'
                }`}
                max={getTodayDate()}
              />
              {errors.拜访日期 && <p className="text-red-500 text-sm mt-1">{errors.拜访日期}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                客户阶段 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.客户阶段}
                onChange={(e) => setFormData(prev => ({ ...prev, 客户阶段: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.客户阶段 ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">请选择客户阶段</option>
                {customerStageOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.客户阶段 && <p className="text-red-500 text-sm mt-1">{errors.客户阶段}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">详细沟通记录</label>
              <textarea
                value={formData.详细沟通记录}
                onChange={(e) => setFormData(prev => ({ ...prev, 详细沟通记录: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="请描述本次拜访的详细情况..."
              />
            </div>

            <div className="md:col-span-2 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 拜访记录列表 */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            拜访记录列表
            {currentUser.role === '管理者' && (
              <span className="ml-2 text-sm text-gray-600">(全员记录)</span>
            )}
          </h3>
        </div>
        
        {getDisplayedRecords().length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {crmState.customers.length === 0 
              ? '请先创建客户，然后添加拜访记录'
              : '暂无拜访记录，点击"新建拜访记录"添加第一条记录'
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">拜访日期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户阶段</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">销售人员</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">沟通记录</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getDisplayedRecords().map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.客户}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.拜访日期}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.客户阶段 === '成交' ? 'bg-green-100 text-green-800' :
                        record.客户阶段 === '合同谈判' ? 'bg-yellow-100 text-yellow-800' :
                        record.客户阶段 === '需求确认' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {record.客户阶段}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.销售人员}</td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-sm text-gray-900 truncate">
                        {record.详细沟通记录 || '无'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        onClick={() => {
                          // 可以实现详情查看功能
                          alert(`拜访记录详情:\n客户: ${record.客户}\n日期: ${record.拜访日期}\n阶段: ${record.客户阶段}\n记录: ${record.详细沟通记录 || '无'}`);
                        }}
                      >
                        查看
                      </button>
                      {record.客户阶段 === '需求确认' && record.销售人员 === currentUser.name && (
                        <button
                          className="text-green-600 hover:text-green-900"
                          onClick={() => {
                            // 转商机申请功能将在商机管理组件中实现
                            updateCRMState({
                              notifications: [...crmState.notifications, '请在商机管理模块提交转商机申请']
                            });
                          }}
                        >
                          转商机
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{getDisplayedRecords().length}</div>
          <div className="text-sm text-gray-600">
            {currentUser.role === '管理者' ? '总拜访记录' : '我的拜访记录'}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {getDisplayedRecords().filter(r => r.客户阶段 === '需求确认').length}
          </div>
          <div className="text-sm text-gray-600">需求确认阶段</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {getDisplayedRecords().filter(r => r.客户阶段 === '合同谈判').length}
          </div>
          <div className="text-sm text-gray-600">合同谈判阶段</div>
        </div>
      </div>
    </div>
  );
} 