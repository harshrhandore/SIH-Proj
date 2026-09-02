// =============================================================================
// Latency Simulation Utility
// =============================================================================
// Wraps mock API responses in a configurable random delay to simulate
// real network and computation latency. Prevents the instant-response
// anti-pattern that reveals a non-functional prototype.
// =============================================================================

/**
 * Wraps any async value in a random delay between min and max milliseconds.
 * @param min - Minimum delay in milliseconds (default: 80)
 * @param max - Maximum delay in milliseconds (default: 400)
 * @returns A function that accepts a value and returns a promise that resolves
 *          after the random delay with that value.
 */
export function simulateLatency<T>(
  min: number = 80,
  max: number = 400
): (value: T) => Promise<T> {
  return (value: T) =>
    new Promise((resolve) => {
      const delay = Math.floor(Math.random() * (max - min + 1)) + min;
      setTimeout(() => resolve(value), delay);
    });
}

/**
 * Wraps a direct value in simulated latency.
 */
export async function withLatency<T>(
  value: T,
  min: number = 80,
  max: number = 400
): Promise<T> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
}

/**
 * Creates a simulated latency promise that can be used to add delay
 * before executing subsequent code.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
