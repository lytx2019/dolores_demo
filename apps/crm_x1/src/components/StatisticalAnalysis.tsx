'use client';

import React, { useState, useMemo } from 'react';

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

interface StatisticalAnalysisProps {
  currentUser: CRMUser;
  crmState: CRMState;
  updateCRMState: (updates: Partial<CRMState>) => void;
}

// 报表配置
const reportConfigs = [
  { 报表名: '商机漏斗', 模板ID: 'RPT_OP_FUNNEL' },
  { 报表名: '拜访转化率', 模板ID: 'RPT_VISIT_CONV' }
];

const periodOptions = ['本月', '本季度', '本年', '全部'];

export function StatisticalAnalysis({ currentUser, crmState, updateCRMState }: StatisticalAnalysisProps) {
  const [activeReport, setActiveReport] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState('月度');

  // 计算商机漏斗数据
  const opportunityFunnelData = useMemo(() => {
    const userOpportunities = currentUser.role === '管理者' 
      ? crmState.opportunities 
      : crmState.opportunities.filter(opp => opp.负责人 === currentUser.name);

    const stageData = {
      '立项评估': { 数量: 0, 金额: 0 },
      '方案制定': { 数量: 0, 金额: 0 },
      '合同谈判': { 数量: 0, 金额: 0 },
      '成交/关闭': { 数量: 0, 金额: 0 }
    };

    userOpportunities.forEach(opp => {
      if (stageData[opp.当前阶段 as keyof typeof stageData]) {
        stageData[opp.当前阶段 as keyof typeof stageData].数量++;
        stageData[opp.当前阶段 as keyof typeof stageData].金额 += Number(opp.预计签单金额);
      }
    });

    return stageData;
  }, [crmState.opportunities, currentUser.role, currentUser.name]);

  // 计算拜访转化率数据
  const visitConversionData = useMemo(() => {
    const userVisitRecords = currentUser.role === '管理者' 
      ? crmState.visitRecords 
      : crmState.visitRecords.filter(record => record.销售人员 === currentUser.name);

    const userApplications = currentUser.role === '管理者' 
      ? crmState.opportunityApplications 
      : crmState.opportunityApplications.filter(app => app.申请人 === currentUser.name);

    // 根据选择的周期过滤数据
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case '本月':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '本季度':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
      case '本年':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredVisits = userVisitRecords.filter(record => {
      const recordDate = new Date(record.拜访日期);
      return recordDate >= startDate;
    });

    const filteredApplications = userApplications.filter(app => {
      const appDate = app.创建时间;
      return appDate && appDate >= startDate;
    });

    const visitCount = filteredVisits.length;
    const applicationCount = filteredApplications.length;
    const conversionRate = visitCount > 0 ? Math.round((applicationCount / visitCount) * 100) : 0;

    return {
      周期: selectedPeriod,
      拜访数: visitCount,
      申请数: applicationCount,
      转化率: `${conversionRate}%`
    };
  }, [crmState.visitRecords, crmState.opportunityApplications, currentUser.role, currentUser.name, selectedPeriod]);

  // 生成转化率数据
  const generateConversionRateData = (period: string) => {
    // 模拟数据，实际应该根据period参数计算
    return [
      { 周期: `第1${period === '月度' ? '月' : period === '季度' ? '季度' : '周'}`, 立项到方案: 75, 方案到谈判: 60, 谈判到成交: 45 },
      { 周期: `第2${period === '月度' ? '月' : period === '季度' ? '季度' : '周'}`, 立项到方案: 80, 方案到谈判: 65, 谈判到成交: 50 },
      { 周期: `第3${period === '月度' ? '月' : period === '季度' ? '季度' : '周'}`, 立项到方案: 70, 方案到谈判: 55, 谈判到成交: 40 }
    ];
  };

  // 生成销售业绩数据
  const generateSalesPerformance = () => {
    const salesPerformance = crmState.visitRecords.reduce((acc, record) => {
      const salesperson = record.销售人员;
      if (!acc[salesperson]) {
        acc[salesperson] = {
          销售人员: salesperson,
          拜访数: 0,
          商机申请数: 0,
          商机数量: 0,
          成交金额: 0,
          成交率: 0
        };
      }
      acc[salesperson].拜访数++;
      return acc;
    }, {} as Record<string, any>);

    // 统计商机申请数
    crmState.opportunityApplications.forEach(app => {
      const salesperson = app.申请人;
      if (salesPerformance[salesperson]) {
        salesPerformance[salesperson].商机申请数++;
      }
    });

    // 统计商机数和金额
    crmState.opportunities.forEach(opp => {
      const salesperson = opp.负责人;
      if (salesPerformance[salesperson]) {
        salesPerformance[salesperson].商机数量++;
        if (opp.状态 === '成交') {
          salesPerformance[salesperson].成交金额 += Number(opp.预计签单金额) || 0;
        }
      }
    });

    // 计算成交率
    Object.values(salesPerformance).forEach((data: any) => {
      data.成交率 = data.商机数量 > 0 ? Math.round((data.成交金额 / (data.商机数量 * 100000)) * 100) : 0;
    });

    return Object.values(salesPerformance)
      .sort((a: any, b: any) => b.成交金额 - a.成交金额);
  };

  // 渲染商机漏斗图表
  const renderOpportunityFunnel = () => {
    const maxAmount = Math.max(...Object.values(opportunityFunnelData).map(item => item.金额));
    
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">商机漏斗分析</h4>
        <div className="space-y-3">
          {Object.entries(opportunityFunnelData).map(([stage, data]) => {
            const widthPercentage = maxAmount > 0 ? (data.金额 / maxAmount) * 100 : 0;
            
            return (
              <div key={stage} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">{stage}</span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{data.数量} 个</div>
                    <div className="text-sm text-gray-600">¥{data.金额.toLocaleString()}</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-800">
            总商机数: {Object.values(opportunityFunnelData).reduce((sum, item) => sum + item.数量, 0)} 个
          </div>
          <div className="text-sm text-blue-800">
            总金额: ¥{Object.values(opportunityFunnelData).reduce((sum, item) => sum + item.金额, 0).toLocaleString()}
          </div>
        </div>
      </div>
    );
  };

  // 渲染拜访转化率报表
  const renderVisitConversion = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-medium text-gray-900">拜访转化率分析</h4>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-sm border border-gray-300 rounded px-3 py-1"
          >
            {periodOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">{visitConversionData.拜访数}</div>
            <div className="text-sm text-blue-800">拜访记录数</div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">{visitConversionData.申请数}</div>
            <div className="text-sm text-green-800">转商机申请数</div>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-600">{visitConversionData.转化率}</div>
            <div className="text-sm text-purple-800">转化率</div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">数据说明</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <div>• 统计周期: {visitConversionData.周期}</div>
            <div>• 转化率计算: (转商机申请数 / 拜访记录数) × 100%</div>
            <div>• 数据范围: {currentUser.role === '管理者' ? '全员数据' : '个人数据'}</div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染销售人员排行榜（仅管理者可见）
  const renderSalesRanking = () => {
    if (currentUser.role !== '管理者') return null;

    const salesPerformance = crmState.visitRecords.reduce((acc, record) => {
      const salesperson = record.销售人员;
      if (!acc[salesperson]) {
        acc[salesperson] = {
          拜访数: 0,
          商机申请数: 0,
          商机数: 0,
          总金额: 0
        };
      }
      acc[salesperson].拜访数++;
      return acc;
    }, {} as Record<string, any>);

    // 统计商机申请数
    crmState.opportunityApplications.forEach(app => {
      const salesperson = app.申请人;
      if (salesPerformance[salesperson]) {
        salesPerformance[salesperson].商机申请数++;
      }
    });

    // 统计商机数和金额
    crmState.opportunities.forEach(opp => {
      const salesperson = opp.负责人;
      if (salesPerformance[salesperson]) {
        salesPerformance[salesperson].商机数++;
        salesPerformance[salesperson].总金额 += Number(opp.预计签单金额);
      }
    });

    const sortedSales = Object.entries(salesPerformance)
      .sort(([, a], [, b]) => b.总金额 - a.总金额);

    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h4 className="text-lg font-medium text-gray-900">销售人员业绩排行</h4>
        </div>
        
        {sortedSales.length === 0 ? (
          <div className="p-6 text-center text-gray-500">暂无业绩数据</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">销售人员</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">拜访数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商机申请数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商机数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总金额</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedSales.map(([name, data], index) => (
                  <tr key={name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.拜访数}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.商机申请数}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.商机数}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{data.总金额.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
            统计分析
          </h2>
          <p className="mt-2 text-gray-600">数据洞察和业务分析</p>
        </div>
        <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
          <div className={`w-2 h-2 rounded-full ${
            currentUser.role === '管理者' ? 'bg-green-500' : 'bg-blue-500'
          }`}></div>
          <span className="text-sm font-medium text-gray-700">数据权限: {currentUser.role}</span>
        </div>
      </div>

      {/* Report Selection */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900">报表选择</h3>
          <p className="mt-1 text-sm text-gray-600">选择您要查看的报表类型</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 商机漏斗分析 */}
            <button
              onClick={() => setActiveReport('opportunity_funnel')}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                activeReport === 'opportunity_funnel'
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activeReport === 'opportunity_funnel' ? 'bg-indigo-500' : 'bg-gray-100'
                }`}>
                  <svg className={`w-5 h-5 ${
                    activeReport === 'opportunity_funnel' ? 'text-white' : 'text-gray-600'
                  }`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <div className="ml-3 text-left">
                  <h4 className="font-semibold text-gray-900">商机漏斗分析</h4>
                  <p className="text-sm text-gray-600">分析商机转化情况</p>
                </div>
              </div>
            </button>

            {/* 转化率分析 */}
            <button
              onClick={() => setActiveReport('conversion_rate')}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                activeReport === 'conversion_rate'
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activeReport === 'conversion_rate' ? 'bg-indigo-500' : 'bg-gray-100'
                }`}>
                  <svg className={`w-5 h-5 ${
                    activeReport === 'conversion_rate' ? 'text-white' : 'text-gray-600'
                  }`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 01-4.306 2.693z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 7.5L21 18M12 18v-6.75M21 12v6.75" />
                  </svg>
                </div>
                <div className="ml-3 text-left">
                  <h4 className="font-semibold text-gray-900">转化率分析</h4>
                  <p className="text-sm text-gray-600">分析各阶段转化率</p>
                </div>
              </div>
            </button>

            {/* 销售业绩排名 */}
            <button
              onClick={() => setActiveReport('sales_ranking')}
              disabled={currentUser.role !== '管理者'}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                currentUser.role !== '管理者' 
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : activeReport === 'sales_ranking'
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  currentUser.role !== '管理者' ? 'bg-gray-200' :
                  activeReport === 'sales_ranking' ? 'bg-indigo-500' : 'bg-gray-100'
                }`}>
                  <svg className={`w-5 h-5 ${
                    currentUser.role !== '管理者' ? 'text-gray-400' :
                    activeReport === 'sales_ranking' ? 'text-white' : 'text-gray-600'
                  }`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.228a25.34 25.34 0 012.916.52 6.003 6.003 0 00-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                  </svg>
                </div>
                <div className="ml-3 text-left">
                  <h4 className={`font-semibold ${currentUser.role !== '管理者' ? 'text-gray-400' : 'text-gray-900'}`}>
                    销售业绩排名
                  </h4>
                  <p className={`text-sm ${currentUser.role !== '管理者' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {currentUser.role !== '管理者' ? '仅管理者可见' : '查看销售排名'}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Period Selection for Conversion Rate */}
          {activeReport === 'conversion_rate' && (
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <label className="block text-sm font-medium text-indigo-800 mb-2">分析周期</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="周度">周度</option>
                <option value="月度">月度</option>
                <option value="季度">季度</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Report Content */}
      {activeReport && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeReport === 'opportunity_funnel' && '商机漏斗分析'}
              {activeReport === 'conversion_rate' && `转化率分析 - ${selectedPeriod}`}
              {activeReport === 'sales_ranking' && '销售业绩排名'}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {activeReport === 'opportunity_funnel' && '展示商机在各个阶段的分布情况'}
              {activeReport === 'conversion_rate' && '展示各阶段的转化率趋势'}
              {activeReport === 'sales_ranking' && '展示销售人员的业绩排名'}
            </p>
          </div>
          
          <div className="p-6">
            {activeReport === 'opportunity_funnel' && (
              <div className="space-y-6">
                {/* Funnel Chart */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(opportunityFunnelData).map(([stage, data]) => (
                    <div key={stage} className="text-center">
                      <div className={`mx-auto mb-3 ${
                        stage === '立项评估' ? 'w-32 h-20' :
                        stage === '方案制定' ? 'w-28 h-18' :
                        stage === '合同谈判' ? 'w-24 h-16' : 'w-20 h-14'
                      } bg-gradient-to-b ${
                        stage === '立项评估' ? 'from-blue-400 to-blue-500' :
                        stage === '方案制定' ? 'from-green-400 to-green-500' :
                        stage === '合同谈判' ? 'from-yellow-400 to-yellow-500' : 'from-purple-400 to-purple-500'
                      } rounded-lg flex items-center justify-center`}>
                        <div className="text-white font-bold text-lg">{data.数量}</div>
                      </div>
                      <h4 className="font-medium text-gray-900">{stage}</h4>
                      <p className="text-sm text-gray-600">{data.金额.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 01-4.306 2.693z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-blue-700">{Object.values(opportunityFunnelData).reduce((sum, item) => sum + item.数量, 0)}</p>
                        <p className="text-blue-600 text-sm">总商机数</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.228a25.34 25.34 0 012.916.52 6.003 6.003 0 00-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-green-700">
                          {Object.values(opportunityFunnelData).filter(item => item.金额 > 0).length}
                        </p>
                        <p className="text-green-600 text-sm">进行中商机</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-100 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-yellow-700">
                          ¥{Object.values(opportunityFunnelData).reduce((sum, item) => sum + item.金额, 0).toLocaleString()}
                        </p>
                        <p className="text-yellow-600 text-sm">总成交金额</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'conversion_rate' && (
              <div className="space-y-6">
                {/* Conversion Rate Chart */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">转化率趋势图 ({selectedPeriod})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {generateConversionRateData(selectedPeriod).map((period, index) => (
                      <div key={period.周期} className="bg-white rounded-lg p-4 shadow-sm">
                        <h5 className="font-medium text-gray-900 mb-2">{period.周期}</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">立项→方案</span>
                            <span className="text-sm font-medium">{period.立项到方案}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">方案→谈判</span>
                            <span className="text-sm font-medium">{period.方案到谈判}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">谈判→成交</span>
                            <span className="text-sm font-medium">{period.谈判到成交}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversion Summary */}
                <div className="bg-indigo-50 rounded-lg p-6">
                  <h4 className="font-medium text-indigo-900 mb-4">转化率分析总结</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-indigo-800 mb-2">转化率最高阶段</h5>
                      <p className="text-indigo-700">立项评估 → 方案制定 (75%)</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-indigo-800 mb-2">需要关注的阶段</h5>
                      <p className="text-indigo-700">合同谈判 → 成交/关闭 (45%)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'sales_ranking' && currentUser.role === '管理者' && (
              <div className="space-y-6">
                {/* Sales Ranking */}
                <div className="space-y-4">
                  {generateSalesPerformance().map((sales: any, index: number) => (
                    <div key={sales.销售人员} className={`flex items-center justify-between p-4 rounded-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200' :
                      index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200' :
                      index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200' :
                      'bg-white border border-gray-100'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-500 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium text-gray-900">{sales.销售人员}</h4>
                          <p className="text-sm text-gray-600">{sales.商机数量} 个商机</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">¥{sales.成交金额.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{sales.成交率}% 成交率</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!activeReport && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">选择报表类型</h3>
            <p className="text-gray-600">请从上方选择您要查看的报表类型</p>
          </div>
        </div>
      )}
    </div>
  );
} 