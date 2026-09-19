import type { ReactNode } from 'react';
import { useAuthGate } from './useAuthGate.js';
import { LockScreen } from './LockScreen.js';
import { setupPin, login, unlock } from './api.js';

export interface AuthGateProps {
  children: ReactNode;
}

/**
 * Top-level gate: renders the appropriate LockScreen mode until the
 * session is unlocked, then renders children (the real app / pixel
 * office). Milestone 3 mounts the office canvas as `children`.
 */
export function AuthGate({ children }: AuthGateProps) {
  const { phase, refresh } = useAuthGate();

  switch (phase) {
    case 'checking':
      return (
        <main className="hm-os-lock-screen">
          <p>확인 중...</p>
        </main>
      );
    case 'denied':
      return (
        <main className="hm-os-lock-screen">
          <p>이 기기/네트워크에서는 HM OS에 접근할 수 없습니다.</p>
        </main>
      );
    case 'setup-required':
      return <LockScreen mode="setup" onSubmit={setupPin} onSuccess={() => void refresh()} />;
    case 'login-required':
      return <LockScreen mode="login" onSubmit={login} onSuccess={() => void refresh()} />;
    case 'locked':
      return <LockScreen mode="locked" onSubmit={unlock} onSuccess={() => void refresh()} />;
    case 'unlocked':
      return <>{children}</>;
    default:
      return null;
  }
}
