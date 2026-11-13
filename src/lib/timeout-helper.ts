/**
 * Utility to race a Promise against a quick timeout.
 * Used for graceful fallback when running in local dev without Cloud Firestore ADC / network.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number = 600,
  fallbackVal?: T
): Promise<T> {
  let timer: NodeJS.Timeout;

  const timeoutPromise = new Promise<T>((resolve, reject) => {
    timer = setTimeout(() => {
      if (fallbackVal !== undefined) {
        resolve(fallbackVal);
      } else {
        reject(new Error(`Operation timed out after ${ms}ms`));
      }
    }, ms);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    return result;
  } catch (err) {
    clearTimeout(timer!);
    if (fallbackVal !== undefined) {
      return fallbackVal;
    }
    throw err;
  }
}

