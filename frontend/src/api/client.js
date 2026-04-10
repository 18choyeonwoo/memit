// src/api/client.js
// Utility to simulate network delay for mock API calls

const DEFAULT_DELAY = 1000;

export const simulateRequest = (data, delay = DEFAULT_DELAY) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 5% error rate for mock testing
      const isError = Math.random() < 0.05;
      if (isError) {
        reject(new Error('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'));
      } else {
        resolve(data);
      }
    }, delay);
  });
};
