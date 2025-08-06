import api from '../axios';

describe('Axios Configuration', () => {
  it('should have correct base URL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:3002');
  });

  it('should have correct default headers', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should have correct timeout', () => {
    expect(api.defaults.timeout).toBe(86400000); // 24 hours
  });

  it('should have withCredentials enabled', () => {
    expect(api.defaults.withCredentials).toBe(true);
  });

  it('should be an instance of axios', () => {
    expect(api.interceptors).toBeDefined();
    expect(api.get).toBeDefined();
    expect(api.post).toBeDefined();
    expect(api.patch).toBeDefined();
    expect(api.delete).toBeDefined();
  });
});
