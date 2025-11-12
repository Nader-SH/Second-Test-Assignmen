import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appendOperation, createStartingNumber, fetchDiscussions } from './api';
import type { CalculationNode, AuthResponse } from './api';
import { usePersistentAuth } from './useAuth';
import { AuthPanel } from './components/AuthPanel';
import { StartNumberForm } from './components/StartNumberForm';
import { CalculationTree } from './components/CalculationTree';

export default function App() {
  const queryClient = useQueryClient();
  const { auth, login, logout } = usePersistentAuth();
  const [creationError, setCreationError] = useState<string | null>(null);
  const [operationNodeId, setOperationNodeId] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['discussions'],
    queryFn: fetchDiscussions,
    refetchInterval: 10000
  });

  const handleAuthSuccess = useCallback(
    (response: AuthResponse) => {
      login(response);
      queryClient.invalidateQueries({ queryKey: ['discussions'] }).catch(() => {
        // ignore refetch errors
      });
    },
    [login, queryClient]
  );

  const createRootMutation = useMutation({
    mutationFn: async (value: number) => {
      if (!auth) {
        throw new Error('You must be logged in to create a discussion.');
      }
      setCreationError(null);
      return createStartingNumber(value, auth.token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] }).catch(() => {
        // ignore refetch errors
      });
    },
    onError: (err: unknown) => {
      setCreationError(err instanceof Error ? err.message : 'Unable to create discussion.');
    }
  });

  const addOperationMutation = useMutation({
    mutationFn: async (payload: {
      parentId: string;
      operation: 'add' | 'subtract' | 'multiply' | 'divide';
      rightOperand: number;
    }) => {
      if (!auth) {
        throw new Error('You must be logged in to respond.');
      }
      setOperationError(null);
      setOperationNodeId(payload.parentId);
      return appendOperation(payload.parentId, payload, auth.token);
    },
    onSuccess: () => {
      setOperationNodeId(null);
      setOperationError(null);
      queryClient.invalidateQueries({ queryKey: ['discussions'] }).catch(() => {
        // ignore refetch errors
      });
    },
    onError: (err: unknown) => {
      setOperationError(err instanceof Error ? err.message : 'Unable to add operation.');
    }
  });

  const discussions: CalculationNode[] = data ?? [];

  return (
    <div className="app-shell">
      <header className="header">
        <h1>Number Discussion Board</h1>
        <p>
          Explore chains of calculations started by the community. Sign in to begin your own or add
          to existing discussions.
        </p>
      </header>

      {auth ? (
        <div className="card">
          <div className="auth-summary">
            <span>
              Signed in as <strong>{auth.user.username}</strong>
            </span>
            <button type="button" className="secondary" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      ) : (
        <AuthPanel onAuthSuccess={handleAuthSuccess} />
      )}

      <div className="card">
        <h2>Calculation Trees</h2>

        {auth && (
          <StartNumberForm
            onCreate={(value) => createRootMutation.mutate(value)}
            isLoading={createRootMutation.isPending}
            error={creationError}
          />
        )}

        {isLoading && <p className="loading">Loading discussions…</p>}
        {error && (
          <p className="error-text">
            {error instanceof Error ? error.message : 'Failed to load discussions.'}
          </p>
        )}

        <CalculationTree
          nodes={discussions}
          canEdit={Boolean(auth)}
          onAddOperation={(parentId, payload) =>
            addOperationMutation.mutate({ parentId, ...payload })
          }
          pendingNodeId={operationNodeId}
          pending={addOperationMutation.isPending}
          errorNodeId={operationNodeId}
          errorMessage={operationError}
        />

        {isFetching && !isLoading && <p className="muted">Refreshing…</p>}
      </div>
    </div>
  );
}

