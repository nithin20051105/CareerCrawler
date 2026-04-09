const parseBoolean = (value, defaultValue = false) => {
  if (value == null) return defaultValue;
  return value.toLowerCase() === 'true';
};

export const appConfig = {
  useMockData: parseBoolean(import.meta.env.VITE_USE_MOCK_DATA, true),
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
};
