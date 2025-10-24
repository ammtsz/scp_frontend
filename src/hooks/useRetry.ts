import { useState, useCallback, useRef } from "react";

interface UseRetryOptions {
  maxAttempts?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
  onMaxAttemptsReached?: () => void;
}

interface UseRetryState {
  attempt: number;
  isRetrying: boolean;
  canRetry: boolean;
}

interface UseRetryReturn extends UseRetryState {
  retry: () => Promise<void>;
  reset: () => void;
}

export function useRetry(
  asyncFunction: () => Promise<void>,
  options: UseRetryOptions = {}
): UseRetryReturn {
  const {
    maxAttempts = 3,
    retryDelay = 1000,
    onRetry,
    onMaxAttemptsReached,
  } = options;

  const [state, setState] = useState<UseRetryState>({
    attempt: 0,
    isRetrying: false,
    canRetry: true,
  });

  // Use ref to track retry state synchronously to prevent race conditions
  const isRetryingRef = useRef(false);

  const retry = useCallback(async () => {
    // Synchronous check to prevent concurrent retries
    if (!state.canRetry || isRetryingRef.current) return;

    isRetryingRef.current = true;
    const nextAttempt = state.attempt + 1;
    
    setState(prev => ({
      ...prev,
      attempt: nextAttempt,
      isRetrying: true,
    }));

    onRetry?.(nextAttempt);

    try {
      // Add retry delay except for first attempt
      if (nextAttempt > 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      await asyncFunction();

      // Reset on success
      isRetryingRef.current = false;
      setState({
        attempt: 0,
        isRetrying: false,
        canRetry: true,
      });
    } catch (error) {
      const canRetryNext = nextAttempt < maxAttempts;
      
      isRetryingRef.current = false;
      setState({
        attempt: nextAttempt,
        isRetrying: false,
        canRetry: canRetryNext,
      });

      if (!canRetryNext) {
        onMaxAttemptsReached?.();
      }

      throw error;
    }
  }, [asyncFunction, state.canRetry, state.attempt, maxAttempts, retryDelay, onRetry, onMaxAttemptsReached]);

  const reset = useCallback(() => {
    isRetryingRef.current = false;
    setState({
      attempt: 0,
      isRetrying: false,
      canRetry: true,
    });
  }, []);

  return {
    ...state,
    retry,
    reset,
  };
}