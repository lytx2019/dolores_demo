Feature: 统计分析
  提供多维度漏斗与转化率报表，支持权限分级可视化。

  Background:
    Given 系统已定义「报表配置表」:
      | 报表名       | 模板ID |
      | 商机漏斗     | RPT_OP_FUNNEL |
      | 拜访转化率   | RPT_VISIT_CONV |

  Rule: 商机漏斗
    Scenario: 查看商机漏斗
      Given 管理者进入「统计分析」模块
      When 选择报表 "商机漏斗"
      Then 系统展示按阶段聚合的商机数量与金额

  Rule: 拜访转化率
    Scenario Outline: 计算拜访→商机转化率
      Given 统计周期为 "<周期>"
      When 系统自动汇总数据
      Then 报表展示 "<周期>" 内拜访数 <拜访数>、转商机申请数 <申请数>、转化率 <转化率>

      Examples:
        | 周期   | 拜访数 | 申请数 | 转化率 |
        | 本月   | 40    | 8     | 20%   |
        | 本季度 | 120   | 30    | 25%   |

  Rule: 数据权限
    Scenario: 销售人员查看个人数据
      Given 销售人员进入「统计分析」
      When 报表加载完成
      Then 仅展示该销售人员相关的数据指标 