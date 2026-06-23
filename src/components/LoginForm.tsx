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
