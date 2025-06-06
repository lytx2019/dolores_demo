Feature: 审批流程
  管理者对线索转商机申请进行把控，保证质量与合规。

  Background:
    Given 系统已定义「审批状态枚举」:
      | 状态    |
      | 待审批  |
      | 已通过  |
      | 已驳回  |

  Rule: 转商机审批
    Scenario: 管理者审批通过
      Given 商机申请 "OP-003" 状态为 "待审批"
      And 登录用户为对应管理者
      When 点击「通过」
      Then 商机申请状态更新为 "已通过"
      And 商机状态更新为 "进行中"
      And 通知申请人

    Scenario: 管理者驳回
      Given 商机申请 "OP-004" 状态为 "待审批"
      When 输入驳回原因 "信息不足"
      And 点击「驳回」
      Then 申请状态更新为 "已驳回"
      And 通知申请人包含驳回原因

  Rule: 权限校验
    Scenario: 非管理者审批拦截
      Given 销售人员尝试审批商机申请
      When 点击「通过」
      Then 系统提示 "无审批权限" 