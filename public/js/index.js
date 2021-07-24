/* eslint-disable */

import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { update } from './updateSetting';
import { bookTour } from './stripe';

const bookBtn = document.getElementById('book-tour');
const mapBox = document.getElementById('map');
const logOutBtn = document.querySelector('.nav__el--logout');
const doc = document.querySelector('.form--login');
const formUserData = document.querySelector('.form-user-data');
const formUserPassword = document.querySelector('.form-user-password');

if (mapBox) {
  const a = JSON.parse(mapBox.dataset.locations);
  displayMap(a);
}

if (doc) {
  doc.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // console.log(email, password);
    login(email, password);
  });
}
if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (formUserData) {
  formUserData.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    update(form, 'data');
  });
}

if (formUserPassword) {
  formUserPassword.addEventListener('submit', (e) => {
    e.preventDefault();
    const password_current = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const password_confirm = document.getElementById('password-confirm').value;
    console.log({ password_current, password, password_confirm });
    update({ password_current, password, password_confirm }, 'password');
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';

    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
