import { CLEAR_HEADER_TITLE, SET_HEADER_TITLE } from '../constants/ActionTypes';

const initialState = {};

export default function headerTitleReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_HEADER_TITLE:
      return { title: payload };
    case CLEAR_HEADER_TITLE:
      return { title: '' };
    default:
      return state;
  }
}
