# 东方妖妖梦 Cucumber 测试框架

## 概述

本项目使用 Cucumber 进行行为驱动开发（BDD），基于 Gherkin 语法编写的需求文档直接驱动自动化测试。

## 项目结构

```
apps/yoo_x1/
├── story/                          # Feature 文件目录
│   ├── character_selection.feature # 角色选择功能
│   ├── difficulty_selection.feature# 难度选择功能
│   ├── stage_progression.feature   # 关卡流程功能
│   ├── danmaku_shooting.feature    # 弹幕射击功能
│   ├── boss_encounter.feature      # BOSS战与符卡功能
│   ├── cherry_point_system.feature # 樱点系统功能
│   └── story_dialogue.feature      # 故事对话功能
├── tests/
│   ├── step-definitions/           # 步骤定义
│   │   └── character-selection.steps.ts
│   └── support/                    # 测试支持文件
│       ├── world.ts               # 测试世界配置
│       └── hooks.ts               # 测试钩子
├── scripts/
│   └── generate-html-report.js     # HTML 报告生成脚本
├── reports/                        # 测试报告目录
│   ├── cucumber-report.html       # HTML 测试报告
│   ├── cucumber-report.json       # JSON 测试数据
│   └── cucumber-usage.txt         # 使用统计报告
├── cucumber.js                     # Cucumber 配置
└── package.json                    # 项目依赖
```

## 运行测试

### 安装依赖
```bash
# 在项目根目录运行
rush update
```

### 运行所有测试
```bash
npm test
```

### 监视模式运行
```bash
npm run test:watch
```

### 生成 HTML 测试报告
```bash
# 运行测试并生成 HTML 报告
npm run test:report

# 运行测试、生成报告并在浏览器中打开
npm run test:report:open

# 仅生成 HTML 报告（需要先运行测试）
npm run generate-report

# 在浏览器中打开已生成的报告
npm run open-report
```

## 测试报告

### HTML 报告功能
- **详细测试结果**: 显示每个场景的执行状态
- **步骤级别分析**: 展示每个测试步骤的成功/失败状态
- **执行时间统计**: 记录测试执行的时间信息
- **元数据展示**: 包含项目信息、环境配置等
- **可视化界面**: 基于 Bootstrap 的现代化 UI

### 查看报告
生成的 HTML 报告位于 `reports/cucumber-report.html`，可以通过以下方式查看：

1. **命令行打开**: `npm run open-report`
2. **直接访问**: `file://[项目路径]/apps/yoo_x1/reports/cucumber-report.html`
3. **浏览器拖拽**: 将 HTML 文件拖入浏览器窗口

## 当前状态

- ✅ **框架已初始化**: Cucumber + TypeScript + Chai
- ✅ **Feature 文件完整**: 7 个功能模块，75 个场景，636 个步骤
- ✅ **基础 Step Definitions**: Character Selection 功能已实现
- ✅ **HTML 报告生成**: 完整的测试报告和可视化界面
- 🔄 **待实现**: 其他 74 个场景的 step definitions

## 测试结果示例

```
75 scenarios (74 undefined, 1 passed)
636 steps (615 undefined, 12 skipped, 9 passed)

📊 HTML 报告统计:
   功能总数: 7
   场景总数: 75
   步骤总数: 786
```

## 下一步开发

1. **实现 Step Definitions**: 根据 Cucumber 输出的代码片段实现各功能的步骤定义
2. **添加游戏逻辑模拟**: 在测试中模拟游戏状态和行为
3. **集成实际组件**: 连接 React 组件进行端到端测试
4. **完善测试覆盖**: 增加边界条件和异常情况的测试

## 开发指南

### 添加新的 Step Definition

1. 在 `tests/step-definitions/` 目录下创建对应的 `.steps.ts` 文件
2. 使用 Cucumber 提供的代码片段作为起点
3. 实现具体的测试逻辑

### 示例 Step Definition

```typescript
import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('系统已定义「配置表」:', function (dataTable: DataTable) {
  const mappings = dataTable.hashes();
  // 实现配置加载逻辑
});

When('玩家执行某个操作', async function () {
  // 实现操作模拟逻辑
});

Then('应该产生预期结果', function () {
  // 实现断言逻辑
  expect(actualResult).to.equal(expectedResult);
});
```

### 报告配置自定义

在 `scripts/generate-html-report.js` 中可以自定义报告的主题、元数据和输出选项：

```javascript
const options = {
  theme: 'bootstrap',        // 报告主题
  jsonFile: '...',          // JSON 数据文件路径
  output: '...',            // HTML 输出路径
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false,      // 是否自动打开报告
  metadata: {               // 自定义元数据
    "App Version": "0.1.0",
    "Project": "东方妖妖梦",
    // ...
  }
};
```

## 技术栈

- **Cucumber**: BDD 测试框架
- **TypeScript**: 类型安全的 JavaScript
- **Chai**: 断言库
- **ts-node**: TypeScript 运行时
- **cucumber-html-reporter**: HTML 报告生成器
- **Next.js**: React 框架（主应用） 