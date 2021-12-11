import { get, post } from '../helpers/httpHelper';

const API_URL = '/api/admin/category';

export const getListCategory = () => {
  return get(`${API_URL}/list`);
};

export const createCategory = (name, prefix) => {
  return post(`${API_URL}`, {
    name,
    prefix,
  });
};
