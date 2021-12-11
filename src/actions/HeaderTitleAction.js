import { CLEAR_HEADER_TITLE, SET_HEADER_TITLE } from '../constants/ActionTypes';

export const setHeaderTitle = (message) => ({
  type: SET_HEADER_TITLE,
  payload: message,
});

export const clearHeaderTitle = () => ({
  type: CLEAR_HEADER_TITLE,
});
