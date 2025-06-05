Feature: Boss Encounter & Spell Card
  每位BOSS拥有多张符卡，击破符卡可获得奖励，失败则损失奖励。

  Background:
    Given 系统已定义「符卡配置表」:
      | 符卡名                 | 时长(s) | 奖励分 |
      | 「冰符　冰袭方阵」     | 30      | 200000 |
      | 「亡灵　华胥的亡灵蝶」 | 45      | 200000 |

  Rule: 符卡宣言规则 — BOSS宣言后计时开始

    Scenario Outline: 符卡宣言与计时
      Given 进入 BOSS Phase
      When BOSS 宣言符卡 <符卡名> 限时 <时长> 秒
      Then 屏幕中央显示符卡标题
      And 计时器开始倒计 <时长> 秒

      Examples:
        | 符卡名                 | 时长 |
        | 「冰符　冰袭方阵」     | 30  |
        | 「亡灵　华胥的亡灵蝶」 | 45  |

  Rule: 符卡奖励规则 — 无Miss无Bomb击破奖励

    Scenario: 完美符卡击破
      Given BOSS 当前符卡剩余时间 > 0
      When 玩家在无Miss无Bomb情况下击破符卡
      Then 获得 "符卡奖励" 标识
      And 追加 200000 分

  Rule: 符卡失败规则 — Miss或Bomb取消奖励

    Scenario: 失败符卡
      When 玩家在符卡期间 Miss 或 Bomb
      Then 取消该符卡奖励 