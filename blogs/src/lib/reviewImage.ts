/** Instagram-ready portrait card. The complete review remains at the shared URL. */
export function downloadReviewImage(title: string, review: string | undefined, url: string): void {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1350
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')

  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#0f766e'
  ctx.fillRect(72, 88, 80, 8)
  ctx.font = 'bold 24px sans-serif'
  ctx.fillText('REVIEW', 72, 145)

  function lines(text: string, width: number): string[] {
    const output: string[] = []
    for (const paragraph of text.trim().split(/\n\s*\n/)) {
      let line = ''
      for (const word of paragraph.split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word
        if (ctx!.measureText(candidate).width <= width) {
          line = candidate
          continue
        }
        if (line) output.push(line)
        line = ''
        // Split unusually long words too, so URLs cannot escape the card.
        for (const char of word) {
          if (ctx!.measureText(line + char).width > width) {
            output.push(line)
            line = ''
          }
          line += char
        }
      }
      output.push(line, '')
    }
    return output
  }

  function draw(text: string, y: number, font: string, lineHeight: number, maxLines: number): number {
    ctx!.font = font
    const wrapped = lines(text, 936)
    while (wrapped.at(-1) === '') wrapped.pop()
    wrapped.slice(0, maxLines).forEach((line, index) => {
      if (index === maxLines - 1 && wrapped.length > maxLines) {
        while (ctx!.measureText(`${line}…`).width > 936) line = line.slice(0, -1)
        line = `${line.trimEnd()}…`
      }
      ctx!.fillText(line, 72, y + index * lineHeight)
    })
    return y + Math.min(wrapped.length, maxLines) * lineHeight
  }

  ctx.fillStyle = '#0f172a'
  const bodyY = draw(title, 235, 'bold 54px sans-serif', 66, 3) + 48
  ctx.fillStyle = '#475569'
  draw(review?.trim() || 'Review coming soon.', bodyY, '32px sans-serif', 49, Math.max(1, Math.floor((1120 - bodyY) / 49)))
  ctx.fillStyle = '#0f766e'
  ctx.font = 'bold 24px sans-serif'
  ctx.fillText('Read the full review · link in caption', 72, 1210)
  ctx.fillStyle = '#64748b'
  ctx.font = '22px sans-serif'
  ctx.fillText(new URL(url).host, 72, 1255)

  const link = document.createElement('a')
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'review'}-instagram.png`
  link.href = canvas.toDataURL('image/png')
  document.body.appendChild(link)
  link.click()
  link.remove()
}
