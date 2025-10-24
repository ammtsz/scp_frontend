import { renderHook, act } from "@testing-library/react";
import { useRetry } from "../useRetry";

describe("useRetry", () => {
  it("initializes with correct default state", () => {
    const mockAsyncFunction = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useRetry(mockAsyncFunction));

    expect(result.current.attempt).toBe(0);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.canRetry).toBe(true);
  });

  it("executes function successfully on first try", async () => {
    const mockAsyncFunction = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useRetry(mockAsyncFunction));

    await act(async () => {
      await result.current.retry();
    });

    expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
    expect(result.current.attempt).toBe(0);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.canRetry).toBe(true);
  });

  it("handles retries on failure", async () => {
    const mockAsyncFunction = jest.fn()
      .mockRejectedValueOnce(new Error("First failure"))
      .mockRejectedValueOnce(new Error("Second failure"))
      .mockResolvedValueOnce(undefined);

    const onRetry = jest.fn();
    const { result } = renderHook(() => 
      useRetry(mockAsyncFunction, { onRetry, maxAttempts: 3 })
    );

    // First attempt (fails)
    await act(async () => {
      try {
        await result.current.retry();
      } catch {
        // Expected to fail
      }
    });

    expect(result.current.attempt).toBe(1);
    expect(result.current.canRetry).toBe(true);
    expect(onRetry).toHaveBeenCalledWith(1);

    // Second attempt (fails)
    await act(async () => {
      try {
        await result.current.retry();
      } catch {
        // Expected to fail
      }
    });

    expect(result.current.attempt).toBe(2);
    expect(result.current.canRetry).toBe(true);
    expect(onRetry).toHaveBeenCalledWith(2);

    // Third attempt (succeeds)
    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.attempt).toBe(0); // Reset on success
    expect(result.current.canRetry).toBe(true);
    expect(onRetry).toHaveBeenCalledWith(3);
    expect(mockAsyncFunction).toHaveBeenCalledTimes(3);
  });

  it("stops retrying after max attempts", async () => {
    const mockAsyncFunction = jest.fn().mockRejectedValue(new Error("Always fails"));
    const onMaxAttemptsReached = jest.fn();
    
    const { result } = renderHook(() => 
      useRetry(mockAsyncFunction, { 
        maxAttempts: 2, 
        onMaxAttemptsReached 
      })
    );

    // First attempt
    await act(async () => {
      try {
        await result.current.retry();
      } catch {
        // Expected to fail
      }
    });

    expect(result.current.canRetry).toBe(true);

    // Second attempt (should reach max)
    await act(async () => {
      try {
        await result.current.retry();
      } catch {
        // Expected to fail
      }
    });

    expect(result.current.attempt).toBe(2);
    expect(result.current.canRetry).toBe(false);
    expect(onMaxAttemptsReached).toHaveBeenCalledTimes(1);
  });

  it("resets state correctly", async () => {
    const mockAsyncFunction = jest.fn().mockRejectedValue(new Error("Fails"));
    const { result } = renderHook(() => useRetry(mockAsyncFunction));

    // Make an attempt that fails
    await act(async () => {
      try {
        await result.current.retry();
      } catch {
        // Expected to fail
      }
    });

    expect(result.current.attempt).toBe(1);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.attempt).toBe(0);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.canRetry).toBe(true);
  });

  it("prevents multiple concurrent retries", async () => {
    const mockAsyncFunction = jest.fn(() => 
      new Promise<void>(resolve => setTimeout(resolve, 100))
    );
    
    const { result } = renderHook(() => useRetry(mockAsyncFunction));

    await act(async () => {
      // Start first retry
      const firstRetry = result.current.retry();
      
      // Try to start second retry while first is running - should be ignored
      const secondRetry = result.current.retry();
      
      await Promise.all([firstRetry, secondRetry]);
    });

    // The hook should prevent the second call since one is already in progress
    // However, the implementation might allow both calls to proceed but only execute the function once
    expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
  });

  it("applies retry delay", async () => {
    const mockAsyncFunction = jest.fn()
      .mockRejectedValueOnce(new Error("First failure"))
      .mockResolvedValueOnce(undefined);

    const retryDelay = 50;
    const { result } = renderHook(() => 
      useRetry(mockAsyncFunction, { retryDelay })
    );

    const startTime = Date.now();

    // First attempt (fails)
    await act(async () => {
      try {
        await result.current.retry();
      } catch {
        // Expected to fail
      }
    });

    // Second attempt (should have delay)
    await act(async () => {
      await result.current.retry();
    });

    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeGreaterThanOrEqual(retryDelay);
    expect(mockAsyncFunction).toHaveBeenCalledTimes(2);
  });
});