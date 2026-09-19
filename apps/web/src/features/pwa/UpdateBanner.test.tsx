import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpdateBanner } from './UpdateBanner.js';
import { onUpdateAvailable } from './swUpdates.js';

vi.mock('./swUpdates.js', () => ({
  onUpdateAvailable: vi.fn(),
}));

describe('UpdateBanner', () => {
  it('renders nothing until an update is signaled', () => {
    render(<UpdateBanner />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the banner and calls applyUpdate when clicked', async () => {
    const applyUpdate = vi.fn();
    vi.mocked(onUpdateAvailable).mockImplementation((listener) => listener(applyUpdate));

    render(<UpdateBanner />);
    expect(screen.getByRole('status')).toHaveTextContent('새 버전이 준비되었습니다.');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '새로고침' }));
    expect(applyUpdate).toHaveBeenCalled();
  });
});
