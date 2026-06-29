import descriptions from './description.yml'

export const BLOGS_SECTION = {
  title: 'Writing',
  description: descriptions.blogs,
  heroHeading: descriptions.blogsHeroHeading,
}

export const READINGS_SECTION = {
  title: 'Readings',
  description: descriptions.readings,
  tag: 'readings',
  cardLabel: 'Reading',
  emptyLabel: 'No readings here yet.',
  reviewLabel: 'Read review ->',
}

export const HOBBIES_SECTION = {
  title: 'Hobbies',
  description: descriptions.hobbies,
  tag: 'hobbies',
}

export const GALLERY_SECTION = {
  title: 'Gallery',
  description: descriptions.gallery,
  tag: 'gallery',
}

export const TRAVEL_SECTION = {
  title: 'Travel',
  description: descriptions.travel,
  tag: 'travel',
  mapTitle: 'States & cities visited',
  mapAttribution:
    '* Map boundaries use india-maps-data GeoJSON; city coordinates are resolved with the Open-Meteo Geocoding API and rendered with ECharts.',
}

export const POST_COPY = {
  backToBlogs: 'Back to Writing',
}
