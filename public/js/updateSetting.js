/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
export const update = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/UpdateMyPassword'
        : '/api/v1/users/UpdateMe';
    console.log(data);
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res) {
      showAlert('success', 'update successfully');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
