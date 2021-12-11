import { get, post, put } from '../helpers/httpHelper';

const API_URL = '/api/auth';

export const loginService = (username, password) => {
  return post(`${API_URL}/signin`, {
    username,
    password,
  }).then((res) => {
    if (res.data.data.deleted) {
      return false;
    }

    if (res.data.data.token) {
      localStorage.setItem('user', JSON.stringify(res.data.data));
    }

    return res.data;
  });
};

export const changePasswordFirstLogin = (code, password) => {
  return put(`${API_URL}/change-password`, {
    code,
    password,
  });
};

export const logoutService = () => {
  localStorage.removeItem('user');
};

export const checkIfDisabledUser = (code) => {
  return get(`${API_URL}/check-deleted/${code}`);
};
