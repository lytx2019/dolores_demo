Feature: Story Dialogue
  对话呈现角色立绘与文本，决定剧情走向与结局解锁逻辑。

  Background:
    Given 系统已定义「对话映射表」:
      | 关卡   | 自机       | 对手       | 对话脚本ID |
      | Stage 1| 博丽灵梦   | 琪露诺     | DLG_S1_RM  |
      | Stage 1| 雾雨魔理沙 | 琪露诺     | DLG_S1_MS  |
      | Stage 1| 十六夜咲夜 | 琪露诺     | DLG_S1_SA  |
      | Stage 5| 雾雨魔理沙 | 魂魄妖梦   | DLG_S5_MS  |

  Rule: 关卡对话呈现 — 开场/中场/结尾对话

    Scenario Outline: 关卡开场对话
      Given 进入 <关卡> 前
      When 系统加载对话脚本
      Then 显示 <自机> 与 <对手> 的立绘
      And 播放对应文本框动画

      Examples:
        | 关卡   | 自机       | 对手       |
        | Stage 1| 博丽灵梦   | 琪露诺     |
        | Stage 5| 雾雨魔理沙 | 魂魄妖梦   |

  Rule: Extra解锁条件 — 正常通关后开放Extra

    Scenario: Extra 关开启条件
      Given 玩家以任意角色在 Normal 难度通关
      And 无 Continue
      When 查看标题菜单
      Then Extra 关卡选项应可选中