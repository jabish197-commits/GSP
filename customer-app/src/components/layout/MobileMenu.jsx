import { Link } from "react-router-dom";
export default function MobileMenu({ open, onClose }) { if (!open) return null; return <nav className="mobile-menu"><Link onClick={onClose} to="/">Home</Link><Link onClick={onClose} to="/collection">Guppies</Link><Link onClick={onClose} to="/enquiry">Enquiry</Link></nav>; }
