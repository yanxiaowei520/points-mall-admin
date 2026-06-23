# 用户登录界面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建极简用户名+密码登录表单 React 组件，纯前端方案

**Architecture:** 单文件函数组件 LoginForm，使用 useState 管理表单状态，提交时进行空值校验，通过 console.log 和 alert 反馈结果。Vite 搭建 React + TypeScript 项目。

**Tech Stack:** React 18+, TypeScript, Vite, Vitest + @testing-library/react (测试)

## Global Constraints

- 纯前端，无后端 API 调用
- 登录方式：用户名 + 密码
- 校验规则：仅提交时校验，用户名和密码均不能为空
- 不做路由、不做状态管理库、不做"记住我"/忘记密码链接
- TDD: RED → GREEN → COMMIT 每个任务

---

### Task 1: Scaffold React + TypeScript 项目

**Files:**
- Create: 项目根目录所有脚手架文件（通过 Vite 生成）

**Interfaces:**
- Produces: React 18 + TypeScript 项目，可运行 `npm run dev`

- [ ] **Step 1: 使用 Vite 创建项目**

```bash
cd d:/workspace/test1 && npm create vite@latest . -- --template react-ts
```
Wait for the prompt. If it asks to overwrite existing files, choose "y" for non-essential files. If it refuses to scaffold into a non-empty directory, use a temp name and move files.

- [ ] **Step 2: 安装依赖**

```bash
npm install
```

- [ ] **Step 3: 安装测试依赖**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 4: 添加测试配置到 `vite.config.ts`**

在 `vite.config.ts` 中添加 `test` 配置：

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
```

- [ ] **Step 5: 创建 `src/test-setup.ts`**

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 6: 添加 test 脚本到 `package.json`**

在 `package.json` 的 `"scripts"` 中添加：
```json
"test": "vitest run"
```

- [ ] **Step 7: 验证项目可运行**

```bash
npm run dev
```
Expected: Vite dev server 启动，无报错。然后 Ctrl+C 停止。

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold React + TypeScript project with Vite and Vitest"
```

---

### Task 2: 编写 LoginForm 组件的失败测试

**Files:**
- Create: `src/components/LoginForm.test.tsx`

**Interfaces:**
- Consumes: `src/test-setup.ts` (from Task 1)
- Produces: `LoginForm` 组件接口约定：接收 `onLogin` prop（`(username: string, password: string) => void`），渲染用户名输入框、密码输入框、登录按钮

- [ ] **Step 1: 编写测试 — 渲染表单元素**

Create `src/components/LoginForm.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  it('renders username input, password input, and login button', () => {
    render(<LoginForm onLogin={vi.fn()} />);

    expect(screen.getByLabelText('用户名')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
  });

  it('renders the form title', () => {
    render(<LoginForm onLogin={vi.fn()} />);

    expect(screen.getByText('用户登录')).toBeInTheDocument();
  });

  it('calls onLogin with username and password on submit', async () => {
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await userEvent.type(screen.getByLabelText('用户名'), 'admin');
    await userEvent.type(screen.getByLabelText('密码'), '123456');
    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    expect(onLogin).toHaveBeenCalledWith('admin', '123456');
  });

  it('shows error when username is empty', async () => {
    render(<LoginForm onLogin={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('密码'), '123456');
    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    expect(screen.getByText('用户名不能为空')).toBeInTheDocument();
  });

  it('shows error when password is empty', async () => {
    render(<LoginForm onLogin={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('用户名'), 'admin');
    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    expect(screen.getByText('密码不能为空')).toBeInTheDocument();
  });

  it('does not call onLogin when validation fails', async () => {
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    expect(onLogin).not.toHaveBeenCalled();
  });

  it('clears fields after successful login', async () => {
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await userEvent.type(screen.getByLabelText('用户名'), 'admin');
    await userEvent.type(screen.getByLabelText('密码'), '123456');
    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    expect(screen.getByLabelText<HTMLInputElement>('用户名').value).toBe('');
    expect(screen.getByLabelText<HTMLInputElement>('密码').value).toBe('');
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
npx vitest run
```
Expected: 所有测试 FAIL — `LoginForm` 组件尚未创建。

- [ ] **Step 3: Commit**

```bash
git add src/components/LoginForm.test.tsx
git commit -m "test: add failing tests for LoginForm component"
```

---

### Task 3: 实现 LoginForm 组件使测试通过

**Files:**
- Create: `src/components/LoginForm.tsx`

**Interfaces:**
- Consumes: `LoginForm.test.tsx` 中定义的接口（from Task 2）
- Produces: `LoginForm` 组件 — `(props: { onLogin: (username: string, password: string) => void }) => JSX.Element`

- [ ] **Step 1: 编写最小实现**

Create `src/components/LoginForm.tsx`:

```typescript
import { useState, FormEvent } from 'react';

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
}

function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('用户名不能为空');
      return;
    }

    if (!password) {
      setError('密码不能为空');
      return;
    }

    setError(null);
    onLogin(username, password);
    setUsername('');
    setPassword('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>用户登录</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <label htmlFor="username">用户名</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">密码</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button type="submit">登录</button>
    </form>
  );
}

export default LoginForm;
```

- [ ] **Step 2: 运行测试验证通过**

```bash
npx vitest run
```
Expected: 所有 7 个测试 PASS。

- [ ] **Step 3: Commit**

```bash
git add src/components/LoginForm.tsx
git commit -m "feat: implement LoginForm component with validation"
```

---

### Task 4: 添加组件样式

**Files:**
- Create: `src/components/LoginForm.css`
- Modify: `src/components/LoginForm.tsx` — 引入 CSS

**Interfaces:**
- Consumes: `LoginForm.tsx` (from Task 3)
- Produces: 居中卡片式登录表单 UI

- [ ] **Step 1: 编写 CSS 样式**

Create `src/components/LoginForm.css`:

```css
.login-form-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.login-form {
  background: #fff;
  padding: 40px 32px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 360px;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 20px;
  color: #333;
}

.login-form .form-group {
  margin-bottom: 16px;
}

.login-form label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #555;
}

.login-form input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.login-form input:focus {
  border-color: #1677ff;
}

.login-form .error-message {
  color: #ff4d4f;
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

.login-form button {
  width: 100%;
  padding: 10px 0;
  background-color: #1677ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-form button:hover {
  background-color: #4096ff;
}
```

- [ ] **Step 2: 更新 LoginForm.tsx 使用 CSS class**

修改 `src/components/LoginForm.tsx` 的 import 和 JSX：

在文件顶部添加：
```typescript
import './LoginForm.css';
```

将 JSX 返回值替换为：

```typescript
  return (
    <div className="login-form-wrapper">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>用户登录</h2>

        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="username">用户名</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">密码</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">登录</button>
      </form>
    </div>
  );
```

- [ ] **Step 3: 运行测试确认未破坏**

```bash
npx vitest run
```
Expected: 所有测试仍然 PASS。

- [ ] **Step 4: Commit**

```bash
git add src/components/LoginForm.css src/components/LoginForm.tsx
git commit -m "style: add centered card layout for LoginForm"
```

---

### Task 5: 集成到 App.tsx

**Files:**
- Modify: `src/App.tsx` — 导入并使用 LoginForm
- Modify: `src/App.css` — 复位全局样式
- Modify: `src/index.css` — 全局 reset

**Interfaces:**
- Consumes: `LoginForm` (from Task 4)
- Produces: 完整的可运行应用

- [ ] **Step 1: 更新全局样式**

Replace `src/index.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
}
```

- [ ] **Step 2: 清空 App.css**

Replace `src/App.css` 为空文件（所有样式已在 LoginForm.css 中）。

- [ ] **Step 3: 更新 App.tsx**

Replace `src/App.tsx`:

```typescript
import LoginForm from './components/LoginForm';

function App() {
  const handleLogin = (username: string, password: string) => {
    console.log('登录信息:', { username, password });
    alert('登录成功');
  };

  return <LoginForm onLogin={handleLogin} />;
}

export default App;
```

- [ ] **Step 4: 验证应用运行**

```bash
npm run dev
```
Expected: 浏览器中显示居中卡片式登录表单。填入用户名和密码点击登录，弹出"登录成功"，控制台输出登录信息。然后 Ctrl+C 停止。

- [ ] **Step 5: 运行完整测试套件**

```bash
npx vitest run
```
Expected: 所有测试 PASS。

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/App.css src/index.css
git commit -m "feat: integrate LoginForm into App"
```

---
