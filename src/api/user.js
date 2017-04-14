import Cookie from 'js-cookie';
import { httpGet, httpPost } from './http';

export function getId() {
  return Cookie.get('client_id');
}

export function getUser() {
  return httpGet('/user');
}

export function signIn(form) {
  return httpPost('/signin', form);
}

export function signUp(form) {
  return httpPost('/signup', form);
}

export function signOut() {
  return httpGet('/logout');
}
