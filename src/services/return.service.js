import { get, getWithParams, post, put } from '../helpers/httpHelper';

const API_URL = '/api/admin/request';
const STAFF_API_URL = '/api/staff/request';

export const getListReturn = (page, size, sort, direction) => {
  return getWithParams(`${API_URL}/getList`, {
    page,
    size,
    sort,
    direction,
  });
};

export const getListSearchAndFilterReturn = (page, size, sort, direction, state, keyword, returnedDate) => {
  return getWithParams(`${API_URL}/searchRequest`, {
    page,
    size,
    sort,
    direction,
    state,
    keyword,
    returnedDate,
  });
};

export const countListReturn = () => {
  return get(`${API_URL}/getRecord`);
};

export const countListSearchAndFilterReturn = (state, keyword, returnedDate) => {
  return getWithParams(`${API_URL}/recordSearch`, {
    state,
    keyword,
    returnedDate,
  });
};
export const getReturnLastDate = () => {
  return get(`${API_URL}/last_date`);
};

export const createNewReturn = (assignmentId, requestBy) => {
  return post(`${API_URL}`, {
    assignmentId,
    requestBy,
  });
};

export const createNewReturnForStaff = (assignmentId, requestBy) => {
  return post(`${STAFF_API_URL}`, {
    assignmentId,
    requestBy,
  });
};

export const completeReturn = (requestId, acceptedBy) => {
  return put(`${API_URL}/accept/${requestId}/${acceptedBy}`, {});
};

export const cancelReturn = (id) => {
  return put(`${API_URL}/cancel/${id}`);
};
