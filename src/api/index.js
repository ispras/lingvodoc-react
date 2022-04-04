import { httpDelete, httpGet, httpPost } from "./http";

export function getTasks() {
  return httpGet("/tasks");
}

export function removeTask(id) {
  return httpDelete(`/tasks/${encodeURIComponent(id)}`);
}
