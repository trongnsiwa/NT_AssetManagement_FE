import { LOGIN_FAIL, LOGIN_SUCCESS, LOGOUT, SET_MESSAGE } from '../constants/ActionTypes';
import ERRORS from '../constants/ErrorCode';
import { loginService, logoutService } from '../services/auth.service';
import { hideLoader } from './LoaderAction';

export const login = (email, password) => (dispatch) => {
  return loginService(email, password).then(
    (data) => {
      if (!data) {
        dispatch({
          type: LOGIN_FAIL,
        });

        dispatch({
          type: SET_MESSAGE,
          payload: ERRORS.ERR_LOGIN_FAIL,
        });

        return Promise.reject();
      }

      dispatch({
        type: LOGIN_SUCCESS,
        payload: { user: data },
      });

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response && error.response.data && error.response.data.message) || error.message || error.toString();

      dispatch({
        type: LOGIN_FAIL,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: ERRORS[message],
      });

      return Promise.reject();
    }
  );
};

export const logout = () => (dispatch) => {
  logoutService();

  dispatch({
    type: LOGOUT,
  });

  dispatch(hideLoader());
};
