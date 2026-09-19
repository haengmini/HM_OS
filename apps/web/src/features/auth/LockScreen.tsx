import { type FormEvent, useState } from 'react';
import type { AuthResult } from './api.js';

export interface LockScreenProps {
  mode: 'setup' | 'login' | 'locked';
  onSubmit: (pin: string) => Promise<AuthResult>;
  onSuccess: () => void;
}

const COPY: Record<LockScreenProps['mode'], { title: string; action: string }> = {
  setup: { title: 'HM OS PIN 설정', action: 'PIN 설정' },
  login: { title: 'HM OS 잠금 해제', action: '로그인' },
  locked: { title: 'HM OS 잠김', action: '잠금 해제' },
};

/**
 * Single screen used for first-time PIN setup, normal login, and
 * unlocking after idle auto-lock. The Tailscale identity check has
 * already happened server-side by the time this renders (Milestone 1
 * `/api/auth/status` only returns a usable phase for a request that
 * already passed the Tailscale guard); this screen is the second
 * factor only.
 */
export function LockScreen({ mode, onSubmit, onSuccess }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const copy = COPY[mode];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (mode === 'setup' && pin !== confirmPin) {
      setError('PIN이 일치하지 않습니다.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit(pin);
      if (result.ok) {
        onSuccess();
      } else {
        setError(result.failure.message);
      }
    } finally {
      setSubmitting(false);
      setPin('');
      setConfirmPin('');
    }
  }

  return (
    <main className="hm-os-lock-screen">
      <form onSubmit={handleSubmit}>
        <h1>{copy.title}</h1>
        <label htmlFor="pin">PIN</label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          minLength={4}
          required
        />
        {mode === 'setup' && (
          <>
            <label htmlFor="confirmPin">PIN 확인</label>
            <input
              id="confirmPin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              minLength={4}
              required
            />
          </>
        )}
        {error && (
          <p role="alert" className="hm-os-lock-screen-error">
            {error}
          </p>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? '확인 중...' : copy.action}
        </button>
      </form>
    </main>
  );
}
