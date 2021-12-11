import { get, getWithParams, put } from '../helpers/httpHelper';

const API_URL = '/api/home';

export const viewUserAssignment = (userCode, sort, direction) => {
  return getWithParams(`${API_URL}/user/${userCode}`, {
    sort,
    direction,
  });
};

export const getAssignmentDetail = (id) => {
  return get(`${API_URL}/assignment/${id}`);
};

export const acceptAssignment = (id) => {
  return put(`${API_URL}/assignment/accept/${id}`);
};

export const declineAssignment = (id) => {
  return put(`${API_URL}/assignment/decline/${id}`);
};
