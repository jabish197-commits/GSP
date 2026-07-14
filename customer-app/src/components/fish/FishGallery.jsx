import { useEffect, useMemo, useState } from "react";

export default function FishGallery({ media = [], name = "Guppy" }) {
  const items = useMemo(() => media.filter((entry) => entry?.url), [media]);
  const [selected,setSelected] = useState(0);
  const item = items[selected] || items[0];

  useEffect(() => setSelected(0), [name]);

  return <div className="fish-gallery">
    <div className="detail-image fish-media-stage">
      {!item && <div className="fish-placeholder large">SJ<span>GUPPY</span></div>}
      {item?.type === "video" && <video key={item.url} className="fish-detail-video" controls playsInline preload="metadata" poster={item.poster} aria-label={`${name} video`}><source src={item.url}/><p>Your browser cannot play this video.</p></video>}
      {item && item.type !== "video" && <img src={item.url} alt={item.alt || name}/>} 
    </div>
    {items.length > 1 && <nav className="fish-media-thumbnails" aria-label={`${name} photos and videos`}>
      {items.map((entry,index) => <button type="button" className={index === selected ? "active" : ""} key={`${entry.url}-${index}`} onClick={() => setSelected(index)} aria-label={`Show ${entry.type === "video" ? "video" : "image"} ${index + 1}`}>
        {entry.type === "video" ? <><video src={entry.url} muted playsInline preload="metadata"/><span aria-hidden="true">▶</span></> : <img src={entry.url} alt=""/>}
      </button>)}
    </nav>}
  </div>;
}
