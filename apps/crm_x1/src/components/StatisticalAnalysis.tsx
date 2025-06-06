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
  const [selectedReport, setSelectedReport] = useState('商机漏斗');
  const [selectedPeriod, setSelectedPeriod] = useState('本月');

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">统计分析</h2>
        <div className="text-sm text-gray-600">
          数据范围: {currentUser.role === '管理者' ? '全员数据' : '个人数据'}
        </div>
      </div>

      {/* 报表选择 */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
          <label className="text-sm font-medium text-gray-700">选择报表:</label>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {reportConfigs.map(config => (
              <option key={config.报表名} value={config.报表名}>{config.报表名}</option>
            ))}
          </select>
        </div>

        {/* 报表内容 */}
        {selectedReport === '商机漏斗' && renderOpportunityFunnel()}
        {selectedReport === '拜访转化率' && renderVisitConversion()}
      </div>

      {/* 销售人员排行榜（仅管理者可见） */}
      {renderSalesRanking()}

      {/* 数据权限提醒 */}
      {currentUser.role === '销售人员' && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                您当前查看的是个人数据统计。如需查看全员数据，请联系管理者。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 数据汇总 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {currentUser.role === '管理者' ? crmState.customers.length : crmState.customers.length}
          </div>
          <div className="text-sm text-gray-600">客户总数</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {currentUser.role === '管理者' 
              ? crmState.visitRecords.length 
              : crmState.visitRecords.filter(r => r.销售人员 === currentUser.name).length
            }
          </div>
          <div className="text-sm text-gray-600">拜访记录数</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {currentUser.role === '管理者' 
              ? crmState.opportunityApplications.length 
              : crmState.opportunityApplications.filter(app => app.申请人 === currentUser.name).length
            }
          </div>
          <div className="text-sm text-gray-600">商机申请数</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-orange-600">
            {currentUser.role === '管理者' 
              ? crmState.opportunities.length 
              : crmState.opportunities.filter(opp => opp.负责人 === currentUser.name).length
            }
          </div>
          <div className="text-sm text-gray-600">进行中商机</div>
        </div>
      </div>
    </div>
  );
} 