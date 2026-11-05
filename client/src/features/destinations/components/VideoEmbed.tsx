interface VideoEmbedProps {
  url: string
  title: string
}

const isYouTube = (url: string) => /(?:youtube\.com|youtube-nocookie\.com|youtu\.be)/i.test(url)

/** YouTube embed URLs play in an iframe; anything else is treated as a video file. */
export const VideoEmbed = ({ url, title }: VideoEmbedProps) => (
  <div className="aspect-video overflow-hidden rounded-card bg-indigo">
    {isYouTube(url) ? (
      <iframe
        src={url}
        title={`${title} video`}
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="size-full"
      />
    ) : (
      <video src={url} controls preload="metadata" className="size-full" aria-label={`${title} video`}>
        Your browser does not support embedded video.
      </video>
    )}
  </div>
)
