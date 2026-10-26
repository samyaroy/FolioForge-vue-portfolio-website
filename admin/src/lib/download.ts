/** Saves text as a file the browser downloads; nothing leaves the page. */
export function downloadText(filename: string, text: string, type = 'application/x-tex') {
  downloadBlob(filename, new Blob([text], { type }))
}

/** The same for bytes, such as a compiled PDF. */
export function downloadBytes(filename: string, bytes: Uint8Array<ArrayBuffer>, type = 'application/pdf') {
  downloadBlob(filename, new Blob([bytes], { type }))
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
