export default function VideoPlayer({ src, poster, title = "Fish video" }) { return <video className="video-player" src={src} poster={poster} controls preload="metadata" aria-label={title}/>; }
