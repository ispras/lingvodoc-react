import config from 'Config';

function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw response;
}

function json(response) {
  return response.json();
}

function wrapFetch(promise) {
  return promise
    .then(status)
    .then(json)
    .then(data => ({ data }))
    .catch(err => ({ err }));
}

export function httpGet(url) {
  return wrapFetch(fetch(config.apiUrl + url, {
    credentials: 'same-origin',
  }));
}

export function httpPost(url, form) {
  return wrapFetch(fetch(config.apiUrl + url, {
    credentials: 'same-origin',
    method: 'post',
    body: JSON.stringify(form),
  }));
}
