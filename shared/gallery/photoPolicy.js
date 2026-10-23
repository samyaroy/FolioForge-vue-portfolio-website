// What a gallery photo on the media host has to be. The admin prepares uploads
// to it and scripts/fit-gallery-images.mjs checks the bucket against it, so a
// photo the admin uploads is one the pre-push check leaves alone.
export const GALLERY_PHOTO_MAX_EDGE = 1920
export const GALLERY_PHOTO_MAX_BYTES = 500 * 1024
export const GALLERY_PHOTO_JPEG_QUALITY = 80
