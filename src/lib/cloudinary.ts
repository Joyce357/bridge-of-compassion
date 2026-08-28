// ─── Cloudinary Server Helper ─────────────────────────────────────────────
// Server-only helper for durable media upload & management across Bridge of Compassion.

import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
})

export const CLOUDINARY_FOLDERS = {
  adminAvatars: 'bridge-of-compassion/admin-avatars',
  programs:     'bridge-of-compassion/programs',
  events:       'bridge-of-compassion/events',
  news:         'bridge-of-compassion/news',
  gallery:      'bridge-of-compassion/gallery',
} as const

/**
 * Upload an admin avatar image buffer to Cloudinary using a deterministic user ID.
 * Applying square crop (400x400), automatic quality, and WebP/auto format.
 */
export async function uploadAdminAvatar(
  buffer: Buffer,
  userId: string,
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDERS.adminAvatars,
        public_id: userId,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'auto', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(error || new Error('Upload to Cloudinary failed.'))
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        })
      },
    )

    uploadStream.end(buffer)
  })
}

/**
 * Safely delete an admin avatar from Cloudinary by user ID.
 */
export async function deleteAdminAvatar(userId: string): Promise<boolean> {
  try {
    const publicId = `${CLOUDINARY_FOLDERS.adminAvatars}/${userId}`
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
    })
    return result.result === 'ok' || result.result === 'not found'
  } catch (err) {
    console.error('[Cloudinary] Failed to delete avatar:', (err as Error)?.message)
    return false
  }
}

/**
 * Upload a News/Story hero or featured image to Cloudinary.
 * Applies landscape 16:9 crop (1200x675), automatic quality, and WebP/auto format.
 */
export async function uploadNewsImage(
  buffer: Buffer,
  publicId?: string,
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder: CLOUDINARY_FOLDERS.news,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 675, crop: 'fill', gravity: 'auto', quality: 'auto', fetch_format: 'auto' },
      ],
    }

    if (publicId) {
      uploadOptions.public_id = publicId
      uploadOptions.overwrite = true
      uploadOptions.invalidate = true
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(error || new Error('Upload to Cloudinary failed.'))
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        })
      },
    )

    uploadStream.end(buffer)
  })
}

/**
 * Safely delete a News image from Cloudinary by its public ID.
 */
export async function deleteNewsImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
    })
    return result.result === 'ok' || result.result === 'not found'
  } catch (err) {
    console.error('[Cloudinary] Failed to delete news image:', (err as Error)?.message)
    return false
  }
}

export { cloudinary }
