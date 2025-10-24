import { ERROR_MESSAGE } from './messages';

export const getErrorMessage = (status?: number) => {
  if(status) {
    switch (status) {
      case 400:
        return ERROR_MESSAGE.BAD_REQUEST;
      case 401:
        return ERROR_MESSAGE.UNAUTHORIZED;
      case 404:
        return ERROR_MESSAGE.NOT_FOUND;
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
      default:
        return ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
    }
  } else {
    return ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
  }
}