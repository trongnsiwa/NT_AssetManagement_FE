import { get } from '../helpers/httpHelper';

const API_URL = '/api/admin/history';

export const checkAssetInHistory = (id) => {
  return get(`${API_URL}/asset/${id}`);
};
