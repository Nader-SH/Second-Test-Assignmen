import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AuthResponse, loginUser, registerUser } from '../api';

interface AuthPanelProps {
  onAuthSuccess: (response: AuthResponse) => void;
}

type Mode = 'login' | 'register';

export function AuthPanel({ onAuthSuccess }: AuthPanelProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      setError(null);
      if (mode === 'login') {
        return loginUser({ username, password });
      }
      return registerUser({ username, password });
    },
    onSuccess: (response) => {
      setUsername('');
      setPassword('');
      onAuthSuccess(response);
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Unable to authenticate.');
    }
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="card">
      <div className="auth-actions">
        <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
        <button
          type="button"
          className="secondary"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          Switch to {mode === 'login' ? 'Register' : 'Login'}
        </button>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter username"
            minLength={3}
            maxLength={32}
            required
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            minLength={6}
            maxLength={128}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>
        {error && <span className="error-text">{error}</span>}
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Submitting…' : mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
    </div>
  );
}

