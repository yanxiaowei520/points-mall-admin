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
