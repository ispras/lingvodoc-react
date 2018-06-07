import config from 'config';

async function wrap(url, params) {
  try {
    const response = await fetch(url, params);
    const data = await response.json();
    if (response.status >= 200 && response.status < 300) {
      return { data };
    }
    return { err: data };
  } catch (e) {
    return { err: 'Network problem' };
  }
}

export function httpGet(url) {
  return wrap(config.apiUrl + url, {
    credentials: 'include',
  });
}

export function httpPost(url, form) {
  return wrap(config.apiUrl + url, {
    credentials: 'include',
    method: 'post',
    body: JSON.stringify(form),
  });
}

export function httpPut(url, form) {
  return wrap(config.apiUrl + url, {
    credentials: 'include',
    method: 'put',
    body: JSON.stringify(form),
  });
}

export function httpDelete(url) {
  return wrap(config.apiUrl + url, {
    credentials: 'include',
    method: 'delete',
  });
}