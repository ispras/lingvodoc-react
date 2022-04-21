import { getId } from "api/user";

export function initMatomo() {
  const url = "https://matomo.at.ispras.ru/";
  window._paq = window._paq || [];
  window._paq.push(["setTrackerUrl", `${url}matomo.php`]);
  window._paq.push(["setSiteId", 1]);
  const clientId = getId();
  if (clientId) {
    window._paq.push(["setCustomVariable", 1, "clientId", clientId]);
  }

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.defer = true;
  script.src = `${url}matomo.js`;
  document.head.appendChild(script);

  window._paq.push(["trackPageView"]);
  window._paq.push(["enableLinkTracking"]);
}

export function startTrackUser(clientId, login) {
  if (window._paq) {
    window._paq.push(["setCustomVariable", 1, "clientId", clientId]);
    window._paq.push(["setUserId", login]);
    window._paq.push(["trackPageView"]);
  }
}

export function stopTrackUser() {
  if (window._paq) {
    window._paq.push(["resetUserId"]);
    window._paq.push(["deleteCustomVariable", 1, "visit"]);
    window._paq.push(["trackPageView"]);
  }
}
