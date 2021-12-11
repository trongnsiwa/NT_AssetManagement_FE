import { get, getWithParams, post, put } from '../helpers/httpHelper';

const API_URL = '/api/admin/asset';

export const getListAssetState = () => {
  return get(`${API_URL}/list-state`);
};

export const getListAsset = (page, size, sort, direction, location) => {
  return getWithParams(`${API_URL}/getList`, {
    page,
    size,
    sort,
    direction,
    location,
  });
};

export const getListSearchAndFilterAsset = (page, size, sort, direction, location, keyword, states, categories) => {
  return getWithParams(`${API_URL}/search`, {
    page,
    size,
    sort,
    direction,
    location,
    keyword,
    states,
    categories,
  });
};

export const countListAsset = (location) => {
  return getWithParams(`${API_URL}/record`, {
    location,
  });
};

export const countListSearchAndFilterAsset = (location, keyword, states, categories) => {
  return getWithParams(`${API_URL}/recordSearch`, {
    location,
    keyword,
    states,
    categories,
  });
};

export const getAssetDetail = (id) => {
  return get(`${API_URL}/${id}`);
};

export const createNewAsset = (name, categoryName, specification, installedDate, managedBy, state, locationId) => {
  return post(`${API_URL}`, {
    name,
    categoryName,
    specification,
    installedDate,
    managedBy,
    state,
    locationId,
  });
};

export const updateAsset = (id, name, categoryId, specification, stateId, installedDate) => {
  return put(`${API_URL}`, {
    id,
    name,
    categoryId,
    specification,
    stateId,
    installedDate,
  });
};

export const checkForDeleteAsset = (id) => {
  return get(`${API_URL}/check-delete/${id}`);
};

export const deleteAsset = (id) => {
  return put(`${API_URL}/delete/${id}`, {});
};

export const getReport = (location) => {
  return getWithParams(`${API_URL}/report`, { location });
};
