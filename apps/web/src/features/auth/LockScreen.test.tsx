import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LockScreen } from './LockScreen.js';

describe('LockScreen', () => {
  it('renders setup mode and requires matching PIN confirmation', async () => {
    const onSubmit = vi.fn();
    const onSuccess = vi.fn();
    render(<LockScreen mode="setup" onSubmit={onSubmit} onSuccess={onSuccess} />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('PIN'), '1234');
    await user.type(screen.getByLabelText('PIN 확인'), '9999');
    await user.click(screen.getByRole('button', { name: 'PIN 설정' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('PIN이 일치하지 않습니다.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits and calls onSuccess on a valid result', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: true });
    const onSuccess = vi.fn();
    render(<LockScreen mode="login" onSubmit={onSubmit} onSuccess={onSuccess} />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('PIN'), '1234');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(onSubmit).toHaveBeenCalledWith('1234');
    expect(onSuccess).toHaveBeenCalled();
  });

  it('shows the server-provided error message on failure', async () => {
    const onSubmit = vi.fn().mockResolvedValue({
      ok: false,
      failure: { reason: 'invalid_pin', message: 'Incorrect PIN.', httpStatus: 401 },
    });
    const onSuccess = vi.fn();
    render(<LockScreen mode="locked" onSubmit={onSubmit} onSuccess={onSuccess} />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('PIN'), '0000');
    await user.click(screen.getByRole('button', { name: '잠금 해제' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect PIN.');
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
