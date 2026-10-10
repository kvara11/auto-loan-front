import { api } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"

// Same limit as the backend's UpdateAvatarRequest; the resized image is far below it.
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024
export const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp"
const AVATAR_SIZE = 256
// Larger originals are refused before decoding (the phone camera case is ~5–10 MB).
const SOURCE_MAX_BYTES = 20 * 1024 * 1024

// `avatar_url` is an API path (`/api/users/:id/avatar?v=…`); the auth cookie goes along because
// the app and the API are the same site (127.0.0.1), as with attachment thumbnails.
export function avatarSrc(url?: string | null) {
  return url ? `${process.env.NEXT_PUBLIC_API_URL}${url}` : undefined
}

export function initials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}` || "?"
}

// The server has no image library (GD), so the browser crops to a centered square and scales down.
export async function resizeAvatar(file: File): Promise<Blob> {
  if (file.size > SOURCE_MAX_BYTES) throw new Error("სურათი ძალიან დიდია (მაქს. 20 MB).")

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error("სურათის წაკითხვა ვერ მოხერხდა. აირჩიეთ JPG, PNG ან WEBP.")
  }

  const side = Math.min(bitmap.width, bitmap.height)
  const size = Math.min(AVATAR_SIZE, side)
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  canvas.getContext("2d")?.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size)
  bitmap.close()

  const toBlob = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.9))
  // Browsers without WEBP encoding return PNG for an unknown type; JPEG is smaller then.
  const webp = await toBlob("image/webp")
  const blob = webp?.type === "image/webp" ? webp : await toBlob("image/jpeg")
  if (!blob) throw new Error("სურათის დამუშავება ვერ მოხერხდა.")
  return blob
}

export async function uploadAvatar(blob: Blob) {
  const body = new FormData()
  body.append("avatar", blob, blob.type === "image/webp" ? "avatar.webp" : "avatar.jpg")

  // The axios instance defaults to JSON; multipart must be set so FormData isn't turned into JSON.
  const response = await api.post<{ avatar_url: string }>(API_ROUTES.settings.avatar, body, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return { avatarUrl: response.data?.avatar_url ?? null, message: response.message }
}

export async function deleteAvatar() {
  const response = await api.delete(API_ROUTES.settings.avatar)
  return response.message
}

// users.manage: remove someone else's avatar (moderation).
export async function deleteUserAvatar(userId: string) {
  return api.delete(API_ROUTES.admin.userAvatar(userId))
}
