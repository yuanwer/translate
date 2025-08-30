# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用开发命令

- `npm run dev` - 启动开发服务器 (http://localhost:5173)
- `npm run build` - 构建生产版本到 dist/ 目录
- `npm run preview` - 预览构建后的应用
- `npm run lint` - 运行 ESLint 检查代码规范

## 项目架构

这是一个基于 React 19 + Vite 7 的现代前端翻译应用：

- **构建工具**: Vite - 快速的开发服务器和构建工具
- **前端框架**: React 19 - 使用函数式组件和 hooks
- **模块系统**: ES modules
- **开发服务器**: 支持热更新 (HMR)

## 代码规范

项目使用 ESLint 进行代码规范检查：
- 基于 `@eslint/js` 推荐规则
- 启用 React Hooks 相关规则检查
- 支持 React Fast Refresh
- 自定义规则：允许大写开头的变量不使用（`varsIgnorePattern: '^[A-Z_]'`）

## 文件结构

- `src/` - 源代码目录
- `public/` - 静态资源目录  
- `dist/` - 构建输出目录（被 ESLint 忽略）
- 主入口：`src/main.jsx`
- 主组件：`src/App.jsx`

## 提示

不要启动开发服务，我想自己启动