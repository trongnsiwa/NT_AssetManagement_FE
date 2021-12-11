import { get, getWithParams, post, put } from '../helpers/httpHelper';

const API_URL = '/api/admin/assignment';

export const checkIfValidAssignment = (id) => {
  return get(`${API_URL}/check-valid/${id}`);
};

export const getListAssignment = (page, size, sort, direction) => {
  return getWithParams(`${API_URL}/getList`, {
    page,
    size,
    sort,
    direction,
  });
};

export const getListSearchAndFilterAssignment = (page, size, sort, keyword, state, direction, assignedDate) => {
  return getWithParams(`${API_URL}/search`, {
    page,
    size,
    sort,
    keyword,
    state,
    direction,
    assignedDate,
  });
};

export const countListAssignment = () => {
  return get(`${API_URL}/record`);
};

export const countListSearchAndFilterAssignment = (keyword, state, assignedDate) => {
  return getWithParams(`${API_URL}/recordSearch`, {
    keyword,
    state,
    assignedDate,
  });
};

export const getAssignmentDetail = (id) => {
  return get(`${API_URL}/${id}`);
};

export const getAssignmentLastDate = () => {
  return get(`${API_URL}/last_date`);
};

export const createNewAssignment = (staffCode, assetId, assignedDate, note, assignBy) => {
  return post(`${API_URL}`, {
    staffCode,
    assetId,
    assignedDate,
    note,
    assignBy,
  });
};

export const updateAssignment = (id, username, prevAssetId, assetId, assignDate, note) => {
  return put(`${API_URL}`, {
    id,
    username,
    prevAssetId,
    assetId,
    assignDate,
    note,
  });
};

export const deleteAssignment = (id) => {
  return put(`${API_URL}/delete/${id}`, {});
};
