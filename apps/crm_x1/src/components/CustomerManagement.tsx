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
  修改日志?: Array<{
    字段: string;
    原值: string;
    新值: string;
    修改时间: Date;
  }>;
}

interface CRMState {
  currentUser?: CRMUser;
  customers: Customer[];
  visitRecords: any[];
  opportunities: any[];
  opportunityApplications: any[];
  notifications: string[];
}

interface CustomerManagementProps {
  currentUser: CRMUser;
  crmState: CRMState;
  updateCRMState: (updates: Partial<CRMState>) => void;
}

// 客户字段配置
const customerFieldConfigs = [
  { 字段: '客户名称', 类型: '文本', 是否必填: '是' },
  { 字段: '客户行业', 类型: '选项', 是否必填: '是' },
  { 字段: '客户分层', 类型: '选项', 是否必填: '是' },
  { 字段: '人员规模', 类型: '选项', 是否必填: '否' },
  { 字段: '国家/地区', 类型: '选项', 是否必填: '否' },
  { 字段: '官方网站', 类型: 'URL', 是否必填: '否' }
];

const industryOptions = ['软件', '制造业', '金融', '教育', '医疗', '零售'];
const tierOptions = ['A', 'B', 'C'];
const scaleOptions = ['1-50人', '51-200人', '201-500人', '500人以上'];
const regionOptions = ['中国', '美国', '日本', '德国', '其他'];

export function CustomerManagement({ currentUser, crmState, updateCRMState }: CustomerManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    客户名称: '',
    客户行业: '',
    客户分层: '',
    人员规模: '',
    国家地区: '',
    官方网站: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      客户名称: '',
      客户行业: '',
      客户分层: '',
      人员规模: '',
      国家地区: '',
      官方网站: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // 检查必填字段
    const requiredFields = customerFieldConfigs
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

    if (editingCustomer) {
      // 编辑客户
      const updatedCustomers = crmState.customers.map(customer => {
        if (customer.id === editingCustomer.id) {
          const oldCustomer = { ...customer };
          const updatedCustomer = {
            ...customer,
            ...formData,
            修改日志: customer.修改日志 || []
          };

          // 记录修改日志
          Object.keys(formData).forEach(field => {
            const key = field as keyof typeof formData;
            const oldValue = oldCustomer[key] || '';
            const newValue = formData[key] || '';
            if (oldValue !== newValue) {
              updatedCustomer.修改日志!.push({
                字段: field,
                原值: oldValue,
                新值: newValue,
                修改时间: new Date()
              });
            }
          });

          return updatedCustomer;
        }
        return customer;
      });

      updateCRMState({ 
        customers: updatedCustomers,
        notifications: [...crmState.notifications, '客户信息更新成功']
      });
      setEditingCustomer(null);
    } else {
      // 新建客户
      const newCustomer: Customer = {
        id: `customer_${Date.now()}`,
        ...formData,
        创建时间: new Date(),
        修改日志: []
      };

      updateCRMState({ 
        customers: [...crmState.customers, newCustomer],
        notifications: [...crmState.notifications, '创建成功']
      });
      setShowCreateForm(false);
    }

    resetForm();
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      客户名称: customer.客户名称,
      客户行业: customer.客户行业,
      客户分层: customer.客户分层,
      人员规模: customer.人员规模 || '',
      国家地区: customer.国家地区 || '',
      官方网站: customer.官方网站 || ''
    });
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingCustomer(null);
    resetForm();
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            客户管理
          </h2>
          <p className="mt-2 text-gray-600">管理和维护您的客户信息</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新建客户
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingCustomer ? '编辑客户' : '新建客户'}
                </h3>
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
                  {/* 客户名称 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      客户名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.客户名称}
                      onChange={(e) => setFormData({ ...formData, 客户名称: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="请输入客户名称"
                    />
                    {errors.客户名称 && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        {errors.客户名称}
                      </p>
                    )}
                  </div>

                  {/* 客户行业 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      客户行业 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.客户行业}
                      onChange={(e) => setFormData({ ...formData, 客户行业: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    >
                      <option value="">请选择行业</option>
                      {industryOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors.客户行业 && (
                      <p className="mt-1 text-sm text-red-600">{errors.客户行业}</p>
                    )}
                  </div>

                  {/* 客户分层 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      客户分层 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.客户分层}
                      onChange={(e) => setFormData({ ...formData, 客户分层: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    >
                      <option value="">请选择分层</option>
                      {tierOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors.客户分层 && (
                      <p className="mt-1 text-sm text-red-600">{errors.客户分层}</p>
                    )}
                  </div>

                  {/* 人员规模 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">人员规模</label>
                    <select
                      value={formData.人员规模}
                      onChange={(e) => setFormData({ ...formData, 人员规模: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    >
                      <option value="">请选择规模</option>
                      {scaleOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* 国家地区 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">国家/地区</label>
                    <select
                      value={formData.国家地区}
                      onChange={(e) => setFormData({ ...formData, 国家地区: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    >
                      <option value="">请选择地区</option>
                      {regionOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* 官方网站 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">官方网站</label>
                    <input
                      type="url"
                      value={formData.官方网站}
                      onChange={(e) => setFormData({ ...formData, 官方网站: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="https://example.com"
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
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    {editingCustomer ? '更新' : '保存'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Customer List */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900">客户列表</h3>
          <p className="mt-1 text-sm text-gray-600">共 {crmState.customers?.length || 0} 个客户</p>
        </div>
        
        {crmState.customers?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr className="border-b border-gray-200/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">客户名称</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">行业</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">分层</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">规模</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">地区</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {crmState.customers.map((customer, index) => (
                  <tr key={customer.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          customer.客户分层 === 'A' ? 'bg-green-500' :
                          customer.客户分层 === 'B' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium text-gray-900">{customer.客户名称}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{customer.客户行业}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.客户分层 === 'A' ? 'bg-green-100 text-green-800' :
                        customer.客户分层 === 'B' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {customer.客户分层}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{customer.人员规模 || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.国家地区 || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {customer.创建时间 ? new Date(customer.创建时间).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        编辑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无客户数据</h3>
            <p className="text-gray-600 mb-6">开始创建您的第一个客户吧</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              新建客户
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 