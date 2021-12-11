import { get, getWithParams, post, put } from '../helpers/httpHelper';

const API_URL = '/api/admin/user';
const STAFF_API_URL = '/api/staff/user';

export const getListUser = (page, size, sort, direction, location) => {
  return getWithParams(`${API_URL}/getList`, {
    page,
    size,
    sort,
    direction,
    location,
  });
};

export const getListSearchAndFilterUser = (page, size, sort, direction, location, searchedBy, type) => {
  return getWithParams(`${API_URL}/search`, {
    page,
    size,
    sort,
    direction,
    location,
    searchedBy,
    type,
  });
};

export const countListUser = (location) => {
  return getWithParams(`${API_URL}/record`, {
    location,
  });
};

export const countListSearchAndFilterUser = (location, searchedBy, type) => {
  return getWithParams(`${API_URL}/search/record`, {
    location,
    searchedBy,
    type,
  });
};

export const getUserDetail = (code) => {
  return get(`${API_URL}/${code}`);
};

export const createNewAccount = (firstName, lastName, dob, gender, joinedDate, role, locationId) => {
  return post(`${API_URL}`, {
    firstName,
    lastName,
    dob,
    gender,
    joinedDate,
    role,
    locationId,
  });
};

export const updateUser = (code, firstName, lastName, dob, gender, joinedDate, roleId) => {
  return put(`${API_URL}`, {
    code,
    firstName,
    lastName,
    dob,
    gender,
    joinedDate,
    roleId,
  });
};

export const disableUser = (code) => {
  return put(`${API_URL}/disable/${code}`, {});
};

export const changePassword = (code, oldPassword, password) => {
  return put(`${API_URL}/change-password`, {
    code,
    oldPassword,
    password,
  });
};

export const changePasswordForStaff = (code, oldPassword, password) => {
  return put(`${STAFF_API_URL}/change-password-inside`, {
    code,
    oldPassword,
    password,
  });
};
