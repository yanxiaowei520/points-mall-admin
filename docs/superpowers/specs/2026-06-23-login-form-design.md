# 用户登录界面 — 设计文档

**日期**: 2026-06-23
**技术栈**: React + TypeScript
**范围**: 纯前端登录表单组件

## 概述

开发一个极简的用户登录界面，使用 React + TypeScript 实现。纯前端方案，不含后端逻辑。登录方式为用户名+密码。

## 架构

单文件函数组件 `LoginForm`，位于 `src/components/LoginForm.tsx`。由 `App.tsx` 直接引用并渲染。

## 组件设计

### LoginForm 组件

**状态**:
- `username: string` — 用户名输入值
- `password: string` — 密码输入值
- `error: string | null` — 校验错误信息

**行为**:
1. 用户填写用户名和密码
2. 点击"登录"按钮，触发前端校验
3. 校验规则：用户名和密码均不能为空
4. 校验失败：显示红色错误提示信息
5. 校验通过：`console.log` 输出登录信息，`alert("登录成功")`，清空表单

**UI 布局**:
- 居中卡片式布局（白色卡片在灰色背景上）
- 标题："用户登录"
- 用户名输入框（含 label）
- 密码输入框（含 label，type="password"）
- 登录按钮
- 错误信息区域（条件渲染）

**样式**:
- 独立 CSS 文件 `src/components/LoginForm.css`
- 响应式居中，卡片最大宽度约 360px
- 输入框全宽，圆角，带边框
- 按钮为主体色背景

## 文件清单

| 文件 | 用途 |
|------|------|
| `src/components/LoginForm.tsx` | 登录表单组件 |
| `src/components/LoginForm.css` | 组件样式 |
| `src/App.tsx` | 引用并使用 LoginForm |

## 不做的事

- 不引入路由
- 不接后端 API
- 不使用状态管理库
- 不做 loading spinner
- 不做"记住我"/忘记密码/注册链接
- 不做实时校验（仅提交时校验）

## 交互流程

```
用户输入用户名 → 用户输入密码 → 点击"登录"
  → 前端校验（空值检查）
    → 失败：显示红色错误提示信息
    → 成功：console.log 输出，alert 提示，清空表单
```
