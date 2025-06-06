Feature: Difficulty Selection
  玩家在选择角色后进入难度选择界面，选择或解锁不同难度并应用相应游戏参数系数。

  Background:
    Given 系统已定义「难度配置表」:
      | 难度名称  | 解锁条件                        | 弹速系数 | 弹幕密度系数 | 符卡时长系数 | 是否默认解锁 |
      | Easy      | 无                              | 0.7      | 0.7          | 1.2          | 是           |
      | Normal    | 无                              | 1.0      | 1.0          | 1.0          | 是           |
      | Hard      | 完成 Normal 难度通关           | 1.3      | 1.3          | 0.9          | 否           |
      | Lunatic   | 完成 Hard 难度通关（无 Continue）| 1.6      | 1.6          | 0.8          | 否           |

  Rule: 难度选择流程 — 从角色选择后进入难度选择

    Scenario: 成功进入难度选择界面
      Given 玩家已完成角色与机体选择
      When 系统加载难度选择界面
      Then 显示「难度配置表」中已解锁难度
      And 光标默认选中 Normal 难度

  Rule: 难度解锁条件 — 高级难度需要满足解锁条件

    Scenario: 选择未解锁的 Lunatic 难度
      Given 玩家尚未通关 Hard 难度
      When 玩家尝试选择 Lunatic 难度
      Then 系统提示 "难度未解锁"
      And 保持难度选择界面

    Scenario: 成功解锁 Lunatic 并选择
      Given 玩家已无 Continue 通关 Hard 难度
      When 玩家选择 Lunatic 难度
      Then 系统确认难度选择为 Lunatic
      And 进入游戏加载画面

  Rule: 难度参数影响 — 不同难度对游戏的影响

    Scenario Outline: 应用难度系数
      Given 当前难度为 <难度名称>
      When 游戏逻辑初始化
      Then 弹速全局系数应为 <弹速系数>
      And 弹幕密度全局系数应为 <密度系数>
      And 符卡时长系数应为 <时长系数>

      Examples:
        | 难度名称 | 弹速系数 | 密度系数 | 时长系数 |
        | Easy     | 0.7      | 0.7      | 1.2      |
        | Normal   | 1.0      | 1.0      | 1.0      |
        | Hard     | 1.3      | 1.3      | 0.9      |
        | Lunatic  | 1.6      | 1.6      | 0.8      | 