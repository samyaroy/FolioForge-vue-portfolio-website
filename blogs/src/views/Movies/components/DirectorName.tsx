type DirectorNameProps = {
  name: string
  imdbUrl?: string
}

export function DirectorName({ name, imdbUrl }: DirectorNameProps) {
  const label = imdbUrl ? `View ${name} on IMDb` : `Search for ${name} on IMDb`

  return (
    <a
      href={imdbUrl || `https://www.imdb.com/find/?q=${encodeURIComponent(name.trim())}&s=nm`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      title={label}
      className="group inline-flex items-center gap-1 rounded text-primary transition-colors hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
    >
      <span className="group-hover:underline">{name}</span>
      <span
        className="inline-flex h-4 items-center rounded-[2px] bg-[#f5c518] px-1 text-[10px] leading-none font-black tracking-[-0.05em] text-black normal-case"
        aria-hidden="true"
      >
        IMDb
      </span>
    </a>
  )
}
