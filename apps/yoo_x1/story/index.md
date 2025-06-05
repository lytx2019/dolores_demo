# 东方妖妖梦 ～ Perfect Cherry Blossom  
## 产品需求文档（BDD / Gherkin）

---

## 1. 项目概述与背景  
东方妖妖梦（Touhou Youyoumu）是东方Project官方弹幕射击系列第 7 作。玩家操纵三名主角（博丽灵梦、雾雨魔理沙、十六夜咲夜）之一，在六大主关卡及 Extra/Phantasm 关卡中，利用樱点系统提升战力、击败各关 BOSS，并最终解决「春雪异变」。

---

## 2. Feature 一览  
| 模块 | Feature 名称 | 描述 |
|----|---------------|-----|
| 角色系统 | Character Selection | 选择角色与机体，决定射击方式、符卡与对话 |
| 难度系统 | Difficulty Selection | 选择或解锁不同难度并应用游戏系数 |
| 核心机制 | Cherry Point System | 通过收集樱点提升樱计量，触发春度状态与残机奖励 |
| 战斗系统 | Danmaku Shooting | 高/低速移动、射击、擦弹判定 |
| 关卡流程 | Stage Progression | 关卡启动、流程控制、评分结算 |
| BOSS 战 | Boss Encounter & Spell Card | 符卡宣言、奖励与失败惩罚 |
| 故事系统 | Story Dialogue | 对话呈现、结局与隐藏关卡解锁 |

---

## 3. 详细 Gherkin 用例  

### 3.1 Feature: Character Selection / 角色选择
```gherkin
Feature: 角色选择
  为玩家提供三名角色与六种机体的选择，影响射击方式及游戏难度平衡。

  Background:
    Given 系统已定义「角色机体映射表」:
      | 角色       | 机体类型      | 射击特性 | 速率 | 威力 |
      | 博丽灵梦   | 灵梦A-追踪符  | 追踪     | 中速 | 中   |
      | 博丽灵梦   | 灵梦B-扩散符  | 扩散     | 低速 | 中   |
      | 雾雨魔理沙 | 魔理沙A-集中符 | 激光集中 | 高速 | 高   |
      | 雾雨魔理沙 | 魔理沙B-高速符 | 高速散射 | 最高 | 低   |
      | 十六夜咲夜 | 咲夜A-范围符  | 刀片散射 | 中速 | 中   |
      | 十六夜咲夜 | 咲夜B-锁定符  | 追踪锁定 | 低速 | 高   |

  Rule: 角色与机体映射 — 每个角色拥有两种专属机体
    Scenario Outline: 成功选择角色与机体
      When 玩家选择 <角色> 并选择 <机体>
      Then 游戏应切换至难度选择界面
      And 已记录玩家选择信息

      Examples:
        | 角色       | 机体         |
        | 博丽灵梦   | 灵梦A-追踪符  |
        | 博丽灵梦   | 灵梦B-扩散符  |
        | 雾雨魔理沙 | 魔理沙A-集中符|
        | 雾雨魔理沙 | 魔理沙B-高速符|
        | 十六夜咲夜 | 咲夜A-范围符  |
        | 十六夜咲夜 | 咲夜B-锁定符  |

  Rule: 返回标题 — 允许玩家取消选择返回主菜单
    Scenario: 放弃选择返回标题
      When 玩家在角色选择界面按下“返回”
      Then 系统返回标题界面
```

### 3.2 Feature: Difficulty Selection / 难度选择
```gherkin
Feature: 难度选择
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
      Then 系统提示 “难度未解锁”
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
```

### 3.3 Feature: Cherry Point System / 樱点系统
```gherkin
Feature: 樱点系统
  玩家通过收集樱点提升樱计量，达到阈值启动春度状态并可获残机。

  Background:
    Given 系统已定义「樱点系统配置表」:
      | 配置ID | 樱计量上限 | 春度持续时间(s) | 春度触发阈值 | 残机奖励首次阈值 | 残机奖励后续间隔 |
      | DEFAULT| 50000      | 10              | 50000        | 3                | 5                |

  Rule: 樱点收集规则 — 每拾取1樱点增加1计量
    Scenario Outline: 收集樱点并触发春度状态
      Given 当前樱计量为 <初始值>
      When 玩家收集了 <收集数量> 个樱点
      Then 樱计量应为 <结果樱计量>
      And 是否触发春度状态 = <是否触发春度>

      Examples:
        | 初始值 | 收集数量 | 是否触发春度 | 结果樱计量 |
        | 49500 | 600   | 是 | 100  |
        | 40000 | 12000 | 是 | 2000 |
        | 0     | 51000 | 是 | 1000 |

  Rule: 春度状态触发规则 — 累计次数奖励残机
    Scenario: 达到奖励残机阈值
      Given 已累计获得 3 次春度状态
      When 再次进入春度状态
      Then 玩家增加 1 残机
```

### 3.4 Feature: Danmaku Shooting / 弹幕射击
```gherkin
Feature: 弹幕射击
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
```

### 3.5 Feature: Stage Progression / 关卡流程
```gherkin
Feature: 关卡流程
  管理六个主关卡及 Extra/Phantasm 的启动、结束与难度流程。

  Background:
    Given 系统已定义「关卡配置表」:
      | 难度  | 关卡号 | 背景音乐ID |
      | Easy  | 1      | BGM_E_1    |
      | Normal| 3      | BGM_N_3    |
      | Hard  | 6      | BGM_H_6    |

  Rule: 关卡加载 — 根据难度和编号初始化资源
    Scenario Outline: 关卡启动
      Given 玩家在难度 <难度> 下开始游戏
      When 关卡编号为 <关卡号> 加载完成
      Then 播放对应的关卡背景音乐
      And 显示关卡标题与BOSS剪影

      Examples:
        | 难度  | 关卡号 |
        | Easy  | 1 |
        | Normal| 3 |
        | Hard  | 6 |

  Rule: 关卡结算 — BOSS击破后展示评分
    Scenario: 关卡完结与评分结算
      When BOSS HP 归零或时间耗尽
      Then 播放通关音效
      And 显示评分结算面板
```

### 3.6 Feature: Boss Encounter & Spell Card / BOSS 战与符卡
```gherkin
Feature: BOSS 战与符卡
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
      Then 获得 “符卡奖励” 标识
      And 追加 200000 分

  Rule: 符卡失败规则 — Miss或Bomb取消奖励
    Scenario: 失败符卡
      When 玩家在符卡期间 Miss 或 Bomb
      Then 取消该符卡奖励
```

### 3.7 Feature: Story Dialogue / 故事系统
```gherkin
Feature: 故事系统
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
```

---

## 4. 用户体验与边界条件
1. **输入延迟容忍度**：操作至渲染延迟 ≤ 100 ms，保证高难度弹幕精确避弹。  
2. **分辨率支持**：最小 640 × 480，窗口/全屏可切换，UI 等比例缩放。  
3. **存档与回放**：每次通关或失败自动生成 replay 文件；异常关闭时写入临时存档保证数据完整。  
4. **性能边界**：同屏最大弹幕数量 ≥ 1500；FPS 目标值 60，低于 55 持续 3 秒触发性能警告。  
5. **键位冲突**：检测多键输入冲突并提供自定义键位方案。  

---

## 5. 附录  
- **难度矩阵**：Easy/Normal/Hard/Lunatic 在弹速、密度、符卡时长等维度按 0.7/1/1.3/1.6 系数缩放。  
- **残机奖励表**：首次春度状态 1UP 累计达 3 次；以后每 5 次额外 1UP。  
- **测试环境**：Windows 10/11，DirectX 9.0c 以上；兼容 Wine。  

---

> 本文档遵循 BDD 最佳实践，所有 Feature、Rule 与 Scenario 既可作为开发需求，也可直接驱动自动化测试。  
