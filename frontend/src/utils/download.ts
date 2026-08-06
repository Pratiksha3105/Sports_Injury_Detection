/** Triggers the browser's save dialog for an in-memory Blob. Used for
 * authenticated file downloads (PDF reports) that can't be a plain
 * `<a href>` because the request needs a Bearer token. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
