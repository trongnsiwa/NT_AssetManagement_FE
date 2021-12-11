import { HIDE_MODAL, SHOW_MODAL } from '../constants/ActionTypes';

const initialState = {
  isOpen: false,
  title: '',
  name: '',
  form: null,
  allowCloseOutside: true,
  reset: null,
};

export default function modalReducer(state = initialState, action) {
  const { type, title, name, form, allowCloseOutside, reset } = action;

  switch (type) {
    case SHOW_MODAL:
      return {
        isOpen: true,
        title,
        name,
        form,
        allowCloseOutside,
        reset,
      };
    case HIDE_MODAL:
      return {
        ...state,
        isOpen: false,
        allowCloseOutside: true,
        reset: null,
      };
    default:
      return state;
  }
}
