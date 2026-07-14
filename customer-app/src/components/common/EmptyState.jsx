export default function EmptyState({ title = "Nothing here yet", message, action }) { return <section className="empty-state"><h2>{title}</h2>{message&&<p>{message}</p>}{action}</section>; }
