/**
 * PUTs a file straight to a presigned R2 URL, reporting progress. Uses XMLHttpRequest
 * because fetch cannot report upload progress. The Content-Type must match the one the
 * server signed.
 */
export const uploadToUrl = (
  url: string,
  file: Blob,
  contentType: string,
  onProgress?: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('PUT', url)
    request.setRequestHeader('Content-Type', contentType)

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total)
    }
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(1)
        resolve()
      } else {
        reject(new Error(`Upload failed (${request.status}). Check the bucket CORS settings.`))
      }
    }
    request.onerror = () =>
      reject(new Error('Upload failed. Check your connection and that the R2 bucket allows this origin (CORS).'))
    request.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'))

    signal?.addEventListener('abort', () => request.abort(), { once: true })
    request.send(file)
  })
