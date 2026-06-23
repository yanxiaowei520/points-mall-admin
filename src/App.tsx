import LoginForm from './components/LoginForm';

function App() {
  const handleLogin = (username: string, password: string) => {
    console.log('登录信息:', { username, password });
    alert('登录成功');
  };

  return <LoginForm onLogin={handleLogin} />;
}

export default App;
