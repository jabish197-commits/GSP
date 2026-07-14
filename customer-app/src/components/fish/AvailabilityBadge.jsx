export default function AvailabilityBadge({ status = "available" }) { return <span className={`status ${status}`}>{status}</span>; }
