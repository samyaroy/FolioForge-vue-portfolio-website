/** Saves text as a file the browser downloads; nothing leaves the page. */
export function downloadText(filename: string, text: string, type = 'application/x-tex') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
