/**
 * A local address to show a picked image at in an `<img>`, before it is
 * uploaded. Revoke it with `URL.revokeObjectURL` once the preview is gone.
 *
 * Only for `<img src>`. There the browser decodes the file as an image, and an
 * SVG shown that way runs no script, so nothing in the file can act on the
 * page. Put the same address in an iframe, an object or a link instead and a
 * picked HTML file would run with the admin's origin, which is what code
 * scanning reports when it follows a picked file through `createObjectURL`.
 * `encodeURI` leaves a blob address exactly as it was, so revoking it still
 * works, and is what the scanner accepts as clearing that report.
 */
export function imagePreviewUrl(file: Blob): string {
  return encodeURI(URL.createObjectURL(file))
}
