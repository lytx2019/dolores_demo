Feature: Danmaku Shooting
  玩家可在高速/低速两种移动模式下射击并擦弹获取分数。

  Background:
    Given 系统已定义「移动模式配置表」:
      | 移动模式 | 操作键 | 期望速度 | 射击形式 |
      | 高速     | Shift  | 低速     | 精准集中 |
      | 低速     | Shift  | 高速     | 散射     |
    And 系统已定义「擦弹判定配置表」:
      | 参数     | 值  |
      | 擦弹距离 | 3px |
      | 擦弹分数 | 500 |
    And 系统已定义「碰撞判定配置表」:
      | 参数           | 值    |
      | 玩家hitbox半径 | 2px   |
      | 敌机hitbox半径 | 8px   |
      | 弹幕hitbox半径 | 4px   |
    And 系统已定义「游戏结束条件配置表」:
      | 条件     | 值  |
      | 初始残机 | 3   |
      | 初始Bomb | 3   |

  Rule: 移动模式切换 — Shift键切换高低速

    Scenario Outline: 模式切换与射击
      Given 玩家处于 <移动模式>
      When 玩家按下 <操作键>
      Then 移动速度应切换为 <期望速度>
      And 射击类型为 <射击形式>

      Examples:
        | 移动模式 | 操作键 | 期望速度 | 射击形式 |
        | 高速     | Shift  | 低速     | 精准集中 |
        | 低速     | Shift  | 高速     | 散射     |

  Rule: 擦弹得分规则 — 距离3px内视为擦弹

    Scenario: 擦弹得分
      Given 子弹与玩家 hitbox 距离小于 3px
      When 没有发生碰撞
      Then 系统记录一次擦弹
      And 给予 500 分基础分数

  Rule: 敌机碰撞判定 — 玩家与敌机或弹幕接触判定

    Scenario Outline: 碰撞判定检测
      Given 玩家位于坐标 (100, 200)
      And 敌机位于坐标 <敌机坐标>
      When 计算两者中心距离
      Then 判定结果为 <是否碰撞>

      Examples:
        | 敌机坐标    | 是否碰撞 |
        | (100, 210) | 是       |
        | (105, 205) | 是       |
        | (112, 212) | 否       |

    Scenario: 弹幕碰撞判定
      Given 玩家 hitbox 半径为 2px
      And 弹幕 hitbox 半径为 4px
      When 玩家中心与弹幕中心距离 ≤ 6px
      Then 判定为碰撞
      And 触发玩家Miss状态

  Rule: 游戏结束判定 — 残机耗尽或主动退出

    Scenario: 残机耗尽游戏结束
      Given 当前残机数为 0
      When 玩家发生碰撞触发Miss
      Then 播放游戏结束音效
      And 显示 "Game Over" 画面
      And 记录最终得分到排行榜

    Scenario: 主动退出游戏
      Given 游戏进行中
      When 玩家按下ESC键选择退出
      Then 暂停游戏显示退出确认对话框
      And 选择确认后返回标题画面

    Scenario: 通关游戏结束
      Given 玩家完成最后一个关卡
      When BOSS被击败且关卡结算完成
      Then 播放通关音效
      And 显示Ending画面
      And 解锁相应难度成就

  Rule: 敌机击毁判定 — 累计伤害达到HP上限

    Scenario Outline: 敌机生命值系统
      Given 敌机类型为 <敌机类型> HP为 <初始HP>
      When 玩家射击命中造成 <伤害值> 点伤害
      Then 敌机剩余HP为 <剩余HP>
      And 击毁状态为 <是否击毁>

      Examples:
        | 敌机类型 | 初始HP | 伤害值 | 剩余HP | 是否击毁 |
        | 小妖精   | 10     | 5      | 5      | 否       |
        | 小妖精   | 10     | 10     | 0      | 是       |
        | 中妖精   | 50     | 30     | 20     | 否       |
        | 大妖精   | 100    | 100    | 0      | 是       |

    Scenario: 敌机击毁奖励
      Given 敌机被击毁
      When 击毁动画播放完成
      Then 在敌机位置生成得分道具
      And 播放击毁音效
      And 根据敌机类型给予对应分数

    Scenario: BOSS击毁特殊处理
      Given BOSS类型敌机HP归零
      When 非符卡阶段被击毁
      Then 进入下一个攻击阶段或符卡
      
      But 符卡阶段被击毁
      Then 符卡宣告结束
      And 判定符卡完成奖励 