export function showResult(containerId, content, isJson = true) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (isJson) {
    el.textContent = JSON.stringify(content, null, 2);
  } else {
    el.textContent = content;
  }

  el.style.display = "block";
}

export function showLoading(containerId, message) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.textContent = message;
  el.style.display = "block";
}
