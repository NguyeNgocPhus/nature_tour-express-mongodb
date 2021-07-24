/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

// sử thông tin
export const update = async (data, type) => {
  try {
    const url =
      type === 'password' 
        ? '/api/v1/users/UpdateMyPassword' /// update password
        : '/api/v1/users/UpdateMe'; // update profile
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
