# Dolores Demo - Rush.js Monorepo

这是一个基于 Rush.js 的 Next.js monorepo 演示项目，展示了如何在 monorepo 环境中组织和管理多个相关项目。

## 项目结构

```
dolores_demo/
├── apps/
│   └── hello-world/         # Next.js 应用
├── packages/
│   └── ui-components/       # 共享 UI 组件库
├── common/                  # Rush 公共配置和依赖
└── rush.json               # Rush 主配置文件
```

## 包含的项目

### 应用 (Apps)
- **hello-world**: 一个 Next.js 应用，展示如何使用共享组件库

### 包 (Packages)  
- **@dolores/ui-components**: 共享的 React 组件库，包含可重用的 UI 组件

## 快速开始

### 安装依赖

```bash
# 安装 Rush (如果还未安装)
npm install -g @microsoft/rush

# 安装所有项目的依赖
rush update
```

### 构建项目

```bash
# 构建所有项目
rush build

# 构建特定项目
rush build --to hello-world
rush build --to @dolores/ui-components
```

### 开发

```bash
# 启动 Next.js 开发服务器
cd apps/hello-world
npm run dev
```

访问 http://localhost:3000 查看应用。

### 开发组件库

```bash
# 监听组件库变化并自动重新构建
cd packages/ui-components
npm run dev
```

## 主要特性

- 🚀 基于 Rush.js 的现代 monorepo 管理
- ⚛️ Next.js 13 应用 (App Router)
- 🎨 Tailwind CSS 样式
- 📦 TypeScript 支持
- 🔗 Workspace 依赖链接
- 🛠️ 共享 UI 组件库

## 技术栈

- **Monorepo 管理**: Rush.js
- **包管理器**: pnpm
- **前端框架**: Next.js 13
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **UI 组件**: React

## 命令说明

- `rush update` - 安装和更新所有依赖
- `rush build` - 构建所有项目
- `rush rebuild` - 清理并重新构建所有项目
- `rush list` - 列出所有项目
- `rush install` - 仅安装依赖（不更新）

## 开发指南

### 添加新的应用
1. 在 `apps/` 目录下创建新项目
2. 在 `rush.json` 的 `projects` 数组中添加项目配置
3. 运行 `rush update` 安装依赖

### 添加新的包
1. 在 `packages/` 目录下创建新包
2. 在 `rush.json` 的 `projects` 数组中添加包配置
3. 运行 `rush update` 安装依赖

### 跨包依赖
使用 `workspace:*` 协议来引用 monorepo 内的其他包：

```json
{
  "dependencies": {
    "@dolores/ui-components": "workspace:*"
  }
}
```

## 了解更多

- [Rush.js 官方文档](https://rushjs.io/)
- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)