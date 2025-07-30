import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = jest.fn();

// Setup global test utilities
beforeEach(() => {
  jest.clearAllMocks();
});
