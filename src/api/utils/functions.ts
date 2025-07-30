import { ERROR_MESSAGE } from './messages';

export const getErrorMessage = (status?: number) => {
  if(status) {
    switch (status) {
      case 401:
        return ERROR_MESSAGE.UNAUTHORIZED;
      default:
        return ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
    }
  } else {
    return ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
  }
}