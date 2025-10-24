import { getErrorMessage } from '../functions';

describe('API Utility Functions', () => {
  describe('getErrorMessage', () => {
    it('should return correct message for 401 status', () => {
      expect(getErrorMessage(401)).toBe('Faça o login para continuar');
    });

    it('should return correct message for 500 status', () => {
      expect(getErrorMessage(500)).toBe('Erro interno do servidor, por favor tente novamente mais tarde');
    });

    it('should return generic message for unknown status', () => {
      expect(getErrorMessage(418)).toBe('Erro interno do servidor, por favor tente novamente mais tarde');
    });

    it('should return correct message for 404 Not Found', () => {
      expect(getErrorMessage(404)).toBe('Recurso não encontrado');
    });

    it('should return correct message for 400 Bad Request', () => {
      expect(getErrorMessage(400)).toBe('Requisição inválida');
    });

    it('should return generic message for undefined status', () => {
      expect(getErrorMessage(undefined)).toBe('Erro interno do servidor, por favor tente novamente mais tarde');
    });

    it('should return generic message for null status', () => {
      expect(getErrorMessage(null as unknown as number)).toBe('Erro interno do servidor, por favor tente novamente mais tarde');
    });

    it('should handle standard status codes', () => {
      expect(getErrorMessage(400)).toBe('Requisição inválida');
      expect(getErrorMessage(404)).toBe('Recurso não encontrado');
      expect(getErrorMessage(401)).toBe('Faça o login para continuar');
      expect(getErrorMessage(500)).toBe('Erro interno do servidor, por favor tente novamente mais tarde');
      expect(getErrorMessage(502)).toBe('Erro interno do servidor, por favor tente novamente mais tarde');
      expect(getErrorMessage(503)).toBe('Erro interno do servidor, por favor tente novamente mais tarde');
    });
  });
});
