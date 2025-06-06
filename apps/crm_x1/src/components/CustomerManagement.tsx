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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">客户管理</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          新建客户
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {editingCustomer ? '编辑客户' : '新建客户'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                客户名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.客户名称}
                onChange={(e) => setFormData(prev => ({ ...prev, 客户名称: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.客户名称 ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入客户名称"
              />
              {errors.客户名称 && <p className="text-red-500 text-sm mt-1">{errors.客户名称}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                客户行业 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.客户行业}
                onChange={(e) => setFormData(prev => ({ ...prev, 客户行业: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.客户行业 ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">请选择行业</option>
                {industryOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.客户行业 && <p className="text-red-500 text-sm mt-1">{errors.客户行业}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                客户分层 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.客户分层}
                onChange={(e) => setFormData(prev => ({ ...prev, 客户分层: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.客户分层 ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">请选择分层</option>
                {tierOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.客户分层 && <p className="text-red-500 text-sm mt-1">{errors.客户分层}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">人员规模</label>
              <select
                value={formData.人员规模}
                onChange={(e) => setFormData(prev => ({ ...prev, 人员规模: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">请选择规模</option>
                {scaleOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">国家/地区</label>
              <select
                value={formData.国家地区}
                onChange={(e) => setFormData(prev => ({ ...prev, 国家地区: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">请选择地区</option>
                {regionOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">官方网站</label>
              <input
                type="url"
                value={formData.官方网站}
                onChange={(e) => setFormData(prev => ({ ...prev, 官方网站: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
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

      {/* 客户列表 */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">客户列表</h3>
        </div>
        
        {crmState.customers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            暂无客户数据，点击"新建客户"添加第一个客户
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">行业</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分层</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">规模</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {crmState.customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.客户名称}</div>
                      {customer.官方网站 && (
                        <div className="text-sm text-blue-600">
                          <a href={customer.官方网站} target="_blank" rel="noopener noreferrer">
                            {customer.官方网站}
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.客户行业}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.客户分层 === 'A' ? 'bg-green-100 text-green-800' :
                        customer.客户分层 === 'B' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {customer.客户分层}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.人员规模 || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.创建时间?.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        编辑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 