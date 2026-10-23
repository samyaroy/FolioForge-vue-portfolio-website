// What a trip cover on the media host has to be: a WebP in blog-travel/, no
// edge over 4K, and under the size cap. blogs/scripts/fit-trip-covers.mjs
// converts covers to it, the admin re-encodes a picked cover to it in the
// browser, and the admin Worker refuses to publish a cover that is not.
export const TRIP_COVER_FOLDER = 'blog-travel/'
export const TRIP_COVER_MAX_EDGE = 3840
export const TRIP_COVER_MAX_BYTES = 10 * 1024 * 1024
// 41 dB PSNR or better against the earlier 4K JPEG copies, at a third less weight.
export const TRIP_COVER_WEBP_QUALITY = 90
