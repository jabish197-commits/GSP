import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { api, apiUrl } from "./services/api.js";
import FishGallery from "./components/fish/FishGallery.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import DataDeletion from "./pages/DataDeletion.jsx";

const demoFish = [
  { _id: "demo-1", slug: "mosaic-dumbo", name: "Mosaic Dumbo", strain: "Premium Mosaic", price: 650, quantity: 4, sex: "pair", status: "available", featured: true, description: "Broad patterned tails, graceful dumbo fins, and strong active movement.", media: [{ url: "/fish/mosaic-dumbo.jpg", type: "image", alt: "Mosaic Dumbo guppy pair" }] },
  { _id: "demo-2", slug: "blue-topaz", name: "Blue Topaz", strain: "Topaz", price: 550, quantity: 6, sex: "pair", status: "available", featured: true, description: "Electric sky-blue colour with a clean body line and healthy finnage.", media: [{ url: "/fish/blue-topaz.jpg", type: "image", alt: "Blue Topaz guppy pair" }] },
  { _id: "demo-3", slug: "red-dragon", name: "Red Dragon", strain: "Dragon", price: 700, quantity: 3, sex: "pair", status: "available", featured: false, description: "Rich red tail, metallic body scales, and carefully selected breeding quality.", media: [{ url: "/fish/red-dragon.jpg", type: "image", alt: "Red Dragon guppy pair" }] },
];

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

function videoPoster(media) {
  if (!media?.url) return "";
  if (media.poster) return media.poster;
  if (!media.url.includes("res.cloudinary.com") || !media.url.includes("/video/upload/")) return "";
  return media.url
    .replace("/video/upload/", "/video/upload/so_0,f_jpg,q_auto/")
    .replace(/\.[a-z0-9]+(?:\?.*)?$/i, ".jpg");
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const timer = window.setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function Header({ cartCount, customer, logout, settings }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname, location.hash]);
  const closeMenu = () => setOpen(false);
  const handleLogout = () => { closeMenu(); logout(); };
  return <header className="site-header"><Link className="brand" to="/" onClick={closeMenu}><img src="/logo.png" alt="SJ Guppy Paradise"/><span><b>SJ GUPPY</b><small>PARADISE</small></span></Link><button className="menu" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="customer-navigation">{open ? "×" : "☰"}</button><nav id="customer-navigation" className={open ? "open" : ""}><Link to="/" onClick={closeMenu}>Home</Link><Link to="/collection" onClick={closeMenu}>Guppies</Link><Link to="/#care" onClick={closeMenu}>Care guide</Link><Link to="/#contact" onClick={closeMenu}>Contact</Link>{settings.instagramUrl&&<a className="instagram-nav" href={settings.instagramUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>Instagram</a>}<Link className="nav-cart" to="/enquiry" onClick={closeMenu}>Enquiry <span>{cartCount}</span></Link>{customer?<><Link className="account-link profile-nav-link" to="/account" onClick={closeMenu}>{customer.avatar?.url?<img src={customer.avatar.url} alt=""/>:<span>{customer.name?.[0]||"U"}</span>}<b>{customer.name.split(" ")[0]}</b><small>Profile</small></Link><button className="nav-logout" onClick={handleLogout}>Logout</button></>:<><Link to="/login" onClick={closeMenu}>Login</Link><Link className="nav-register" to="/register" onClick={closeMenu}>Register</Link></>}</nav></header>;
}

function Footer({ settings }) {
  return <footer id="contact"><div><img src="/logo.png" alt=""/><p>Healthy guppies, honest guidance, and breeder-direct care.</p>{settings.instagramUrl&&<a className="instagram-link" href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Visit SJ Guppy Paradise on Instagram"><span aria-hidden="true">◎</span> Follow us on Instagram</a>}</div><div><h4>Visit & contact</h4><p>{settings.location || "Location shared during order confirmation"}</p><p>{settings.phone || "Phone number coming soon"}</p><p>{settings.email || "Email coming soon"}</p></div><div><h4>Customer promise</h4><p>Availability and safe delivery are confirmed before payment.</p><p className="footer-policies"><Link to="/privacy">Privacy</Link><Link to="/data-deletion">Data deletion</Link></p></div><small>© {new Date().getFullYear()} SJ Guppy Paradise. Freshwater tropical fish.</small></footer>;
}

function FishCard({ fish, add }) {
  const preview = fish.media?.find((item) => item.url);
  const media = preview?.type === "video"
    ? <video className="fish-card-video" src={preview.url} poster={videoPoster(preview)} muted autoPlay loop playsInline preload="metadata" aria-label={`${fish.name} preview`}/>
    : preview?.url
      ? <img src={preview.url} alt={preview.alt || fish.name}/>
      : <div className="fish-placeholder">SJ<span>GUPPY</span></div>;
  return <article className="fish-card"><Link className="fish-image" to={`/fish/${fish.slug || fish._id}`}>{media}<span className={`status ${fish.status}`}>{fish.status}</span></Link><div className="fish-body"><p className="eyebrow">{fish.strain}</p><Link to={`/fish/${fish.slug || fish._id}`}><h3>{fish.name}</h3></Link><div className="price-row"><strong>{money(fish.price)}</strong><small>{fish.sex} · {fish.quantity} available</small></div><button onClick={() => add(fish)} disabled={fish.status !== "available"}>Add enquiry</button></div></article>;
}

function Home({ fish, add, settings }) {
  return <><section className="hero"><div className="hero-copy"><p className="eyebrow">Home-bred · Healthy · Hand-selected</p><h1>{settings.heroTitle || "Colour that comes alive."}</h1><p>{settings.heroSubtitle || "Premium guppies raised with patient care and selected for colour, health, and movement."}</p><div className="hero-actions"><Link className="primary" to="/collection">Explore available guppies</Link><a className="secondary" href="#care">First-time keeper guide</a></div><div className="trust"><span><b>Breeder direct</b> Clear fish history</span><span><b>Care support</b> Before and after purchase</span></div></div><div className="hero-art"><div className="aqua-orbit"></div><img src="/logo.png" alt="SJ Guppy Paradise logo"/><p>Freshwater tropical fish</p></div></section><section className="ticker"><span>Healthy stock</span><span>Live arrival planning</span><span>Care guidance</span><span>Mobile-friendly ordering</span></section><section className="section"><div className="section-head"><div><p className="eyebrow">This week's selection</p><h2>Meet the favourites</h2></div><Link to="/collection">View all guppies →</Link></div><div className="fish-grid">{fish.slice(0, 3).map((item) => <FishCard key={item._id} fish={item} add={add}/>)}</div></section><section className="care-section" id="care"><div><p className="eyebrow">Simple care, thriving fish</p><h2>A confident start for every keeper.</h2><p>Every order includes straightforward guidance suited to your fish and aquarium.</p></div><div className="care-grid"><article><b>01</b><h3>Cycled water</h3><p>Prepare a stable aquarium before your guppies arrive.</p></article><article><b>02</b><h3>Gentle acclimation</h3><p>Match temperature and introduce water gradually.</p></article><article><b>03</b><h3>Small feeds</h3><p>Feed quality food in small portions once or twice daily.</p></article><article><b>04</b><h3>Regular care</h3><p>Maintain clean water without sudden large changes.</p></article></div></section><section className="story" id="about"><div className="story-mark">SJ</div><div><p className="eyebrow">A breeder, not a warehouse</p><h2>Raised closely. Shared responsibly.</h2><p>SJ Guppy Paradise focuses on healthy lines, careful observation, and honest availability. We confirm every enquiry personally so the right fish reaches the right home.</p><a href="#contact">Talk to the breeder →</a></div></section></>;
}

function Collection({ fish, add }) {
  const [query, setQuery] = useState(""); const [status, setStatus] = useState("available");
  const shown = useMemo(() => fish.filter((item) => (!status || item.status === status) && `${item.name} ${item.strain}`.toLowerCase().includes(query.toLowerCase())), [fish, query, status]);
  return <main className="page"><div className="page-title"><p className="eyebrow">Live catalogue</p><h1>Available guppies</h1><p>Choose a fish to learn more, then send an enquiry for breeder confirmation.</p></div><div className="filters"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or strain"/><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option></select></div><div className="fish-grid">{shown.map((item) => <FishCard key={item._id} fish={item} add={add}/>)}</div>{!shown.length && <p className="empty">No guppies match your search.</p>}</main>;
}

function FishDetails({ fish, add }) {
  const { slug } = useParams(); const item = fish.find((entry) => entry.slug === slug || entry._id === slug); const navigate = useNavigate();
  if (!item) return <main className="page empty"><h1>Fish not found</h1><Link to="/collection">Return to the collection</Link></main>;
  return <main className="detail"><button className="detail-back-icon" onClick={() => navigate(-1)} aria-label="Go back" title="Go back">←</button><FishGallery media={item.media} name={item.name}/><div className="detail-copy"><button className="back detail-back-text" onClick={() => navigate(-1)}>← Back</button><p className="eyebrow">{item.strain}</p><h1>{item.name}</h1><strong className="detail-price">{money(item.price)}</strong><p>{item.description}</p><dl><div><dt>Selection</dt><dd>{item.sex}</dd></div><div><dt>Availability</dt><dd>{item.quantity} · {item.status}</dd></div><div><dt>Breeder support</dt><dd>Included</dd></div></dl><button className="primary full" onClick={() => add(item)}>Add to enquiry</button><small>{"Final availability and delivery are confirmed personally before payment."}</small></div></main>;
}

function packageFishCount(item) {
  return item.selectionType === "trio" ? 3 : item.selectionType === "set" ? 4 : item.selectionType === "custom" ? Number(item.fishPerPack || 1) : 2;
}

function estimatedItemTotal(item) {
  const baseCount = item.sex === "pair" ? 2 : 1;
  return Math.round(item.price * packageFishCount(item) / baseCount) * Number(item.orderQuantity || 1);
}

function UpiPaymentActions({order,settings,onOpened}) {
  if(!settings.upiId) return <div className="upi-unavailable">Online UPI payment is being configured. You can still scan the QR code.</div>;
  const params=new URLSearchParams({
    pa:settings.upiId,
    pn:settings.paymentName||"SJ Guppy Paradise",
    am:Number(order.total).toFixed(2),
    cu:"INR",
    tr:order.orderNumber,
    tn:`SJ Guppy Paradise ${order.orderNumber}`,
  }).toString();
  const openPayment=(scheme)=>{
    onOpened?.();
    window.location.href=`${scheme}${params}`;
  };
  return <section className="upi-payment-actions"><p className="eyebrow">PAY USING YOUR PHONE</p><h3>Pay {money(order.total)}</h3><p>The amount and order reference will be filled automatically.</p><button type="button" className="upi-primary" onClick={()=>openPayment("upi://pay?")}>Pay with any UPI app</button><div><button type="button" onClick={()=>openPayment("tez://upi/pay?")}>Google Pay</button><button type="button" onClick={()=>openPayment("phonepe://pay?")}>PhonePe</button></div><small>Confirm the receiver name and amount inside your payment app before entering your UPI PIN.</small></section>;
}

function PaymentConfirmation({ order, customer, settings }) {
  const navigate=useNavigate();
  const [busy,setBusy]=useState(false),[error,setError]=useState(""),[sent,setSent]=useState(false),[preview,setPreview]=useState(""),[paymentOpened,setPaymentOpened]=useState(false);
  const goBack=()=>window.history.length>1?navigate(-1):navigate("/account",{replace:true});
  const submitProof=async(file)=>{if(!file)return;setError("");setPreview(URL.createObjectURL(file));setBusy(true);try{const uploadBody=new FormData();uploadBody.append("file",file);const uploaded=await api("/media/payment-proof",{method:"POST",body:uploadBody});const sessionKey=`sj-chat-session:${customer.id}`;const saved=localStorage.getItem(sessionKey);const session=await api("/chat/session",{method:"POST",body:JSON.stringify({sessionId:saved})});localStorage.setItem(sessionKey,session.chat.sessionId);await api(`/orders/${order.orderNumber}/payment-proof`,{method:"POST",body:JSON.stringify({media:uploaded.media,chatSessionId:session.chat.sessionId})});setSent(true)}catch(value){setError(value.message)}finally{setBusy(false)}};
  return <main className="page payment-page"><button type="button" className="payment-back-button" onClick={goBack} aria-label="Go back"><span aria-hidden="true">{"\u2190"}</span><b>Back</b></button><section className="payment-summary"><span className="payment-check">✓</span><p className="eyebrow">ENQUIRY CREATED</p><h1>Complete payment</h1><p>Reference <b>{order.orderNumber}</b></p><strong>{money(order.total)}</strong><p>Your payment is manually verified by SJ Guppy Paradise. Never send your OTP, UPI PIN, or banking password.</p></section><section className="payment-card"><h2>Scan and pay</h2>{settings.paymentQr?.url?<img className="payment-qr" src={settings.paymentQr.url} alt="SJ Guppy Paradise GPay and PhonePe QR code"/>:<div className="qr-missing">Payment QR has not been added by the breeder yet.</div>}<h3>{settings.paymentName||"SJ Guppy Paradise"}</h3><p>{settings.paymentInstructions||"Scan with GPay or PhonePe, then upload your payment screenshot."}</p><UpiPaymentActions order={order} settings={settings} onOpened={()=>setPaymentOpened(true)}/>{paymentOpened&&<p className="payment-return-note">After completing payment, return here and upload the success screenshot.</p>}<div className="proof-upload"><label>Upload payment screenshot<input type="file" accept="image/*" disabled={(!settings.paymentQr?.url&&!settings.upiId)||busy||sent} onChange={e=>submitProof(e.target.files[0])}/><span>{busy?"Uploading and sending…":sent?"Screenshot sent to private chat ✓":"Choose screenshot image"}</span></label>{preview&&<img src={preview} alt="Payment screenshot preview"/>}{error&&<p className="error">{error}</p>}{sent&&<p className="payment-success">Your screenshot was sent to the admin chat. Payment status is now awaiting verification.</p>}</div><Link className="secondary full" to="/account">View my enquiries</Link></section></main>;
}

function Enquiry({ cart, remove, clear, customer, settings, updateItem }) {
  const [form, setForm] = useState({ name: customer.name, phone: customer.phone, email: customer.email, address: "", notes: "" }); const [result, setResult] = useState(null); const [busy, setBusy] = useState(false);
  const estimate=cart.reduce((sum,item)=>sum+estimatedItemTotal(item),0);
  const submit = async (e) => { e.preventDefault(); setBusy(true); try { const data = await api("/orders", { method: "POST", body: JSON.stringify({ customer: form, notes: form.notes, items: cart.map((fish) => ({ fish: fish._id, quantity: fish.orderQuantity, selectionType: fish.selectionType, fishPerPack: packageFishCount(fish) })) }) }); setResult(data.order); clear(); } catch (error) { setResult({ error: error.message }); } finally { setBusy(false); } };
  if (result && !result.error) return <PaymentConfirmation order={result} customer={customer} settings={settings}/>;
  return <main className="page enquiry"><div><p className="eyebrow">SELECT FISH & QUANTITY</p><h1>Build your enquiry</h1><p>Choose pair, trio, set, or a custom number of fish. The final amount is securely recalculated by the server.</p><div className="cart-list configured-cart">{cart.map((fish) => <div key={fish._id}><span>{fish.name}<small>{fish.strain} · listed as {fish.sex}</small></span><div className="selection-controls"><label>Selection<select value={fish.selectionType} onChange={e=>updateItem(fish._id,{selectionType:e.target.value,fishPerPack:e.target.value==="custom"?fish.fishPerPack:undefined})}><option value="pair">Pair (2 fish)</option><option value="trio">Trio (3 fish)</option><option value="set">Set (4 fish)</option><option value="custom">Custom</option></select></label>{fish.selectionType==="custom"&&<label>Fish per pack<input type="number" min="1" max="50" value={fish.fishPerPack||1} onChange={e=>updateItem(fish._id,{fishPerPack:Number(e.target.value)})}/></label>}<label>Number of packs<input type="number" min="1" max={fish.availableQuantity||1} value={fish.orderQuantity} onChange={e=>updateItem(fish._id,{orderQuantity:Number(e.target.value)})}/></label></div><div className="cart-price"><small>{packageFishCount(fish)*fish.orderQuantity} fish total</small><b>{money(estimatedItemTotal(fish))}</b></div><button onClick={() => remove(fish._id)}>Remove</button></div>)}{!cart.length && <p>Your enquiry list is empty.</p>}</div><div className="estimate"><span>Estimated total</span><strong>{money(estimate)}</strong></div></div><form onSubmit={submit}><label>Name<input required value={form.name} readOnly/></label><label>Phone / WhatsApp<input required value={form.phone} readOnly/></label><label>Email<input type="email" value={form.email} readOnly/></label><label>Delivery location<textarea required value={form.address} onChange={(e) => setForm({...form, address:e.target.value})}/></label><label>Message<textarea value={form.notes} onChange={(e) => setForm({...form, notes:e.target.value})}/></label>{result?.error && <p className="error">{result.error}</p>}<button className="primary full" disabled={!cart.length || busy}>{busy ? "Creating enquiry…" : `Continue to payment · ${money(estimate)}`}</button></form></main>;
}

function CustomerAuth({ mode, onAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const registering = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", whatsappOptIn: false });
  const [error, setError] = useState(() => new URLSearchParams(location.search).get("oauthError") || "");
  const [busy, setBusy] = useState(false);
  const startSocialLogin = () => {
    sessionStorage.setItem("sj_oauth_return_to", location.state?.from || "/account");
  };
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (registering && form.password !== form.confirmPassword) return setError("Passwords do not match.");
    setBusy(true);
    try {
      const body = registering
        ? { name: form.name, email: form.email, phone: form.phone, password: form.password, whatsappOptIn: form.whatsappOptIn }
        : { email: form.email, password: form.password };
      const data = await api(`/customer-auth/${mode}`, { method: "POST", body: JSON.stringify(body) });
      onAuthenticated(data.customer);
      navigate(location.state?.from || "/account", { replace: true });
    } catch (value) {
      setError(value.message);
    } finally {
      setBusy(false);
    }
  };
  return <main className="auth-page"><section className="auth-card"><img src="/logo.png" alt="SJ Guppy Paradise"/><p className="eyebrow">CUSTOMER ACCOUNT</p><h1>{registering ? "Create your account" : "Welcome back"}</h1><p>{registering ? "Register to send enquiries and follow their status." : "Sign in to view your enquiries and account."}</p>{error&&<p className="error">{error}</p>}<form onSubmit={submit}>{registering&&<label>Full name<input required autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>}<label>Email<input required type="email" autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>{registering&&<label>Phone / WhatsApp<input required autoComplete="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>}<label>Password<input required minLength="8" type="password" autoComplete={registering?"new-password":"current-password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>{registering&&<label>Confirm password<input required minLength="8" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})}/></label>}{registering&&<label className="whatsapp-consent"><input required type="checkbox" checked={form.whatsappOptIn} onChange={e=>setForm({...form,whatsappOptIn:e.target.checked})}/><span>Send my registration confirmation and order updates to this WhatsApp number.</span></label>}<button className="primary full" disabled={busy}>{busy?"Please wait…":registering?"Create account":"Login securely"}</button></form><div className="auth-divider"><span>or continue with</span></div><div className="social-auth"><a className="social-login google" href={apiUrl("/customer-auth/oauth/google/start")} onClick={startSocialLogin}><span aria-hidden="true"><i></i><i></i><i></i><i></i></span>Continue with Google</a><a className="social-login facebook" href={apiUrl("/customer-auth/oauth/facebook/start")} onClick={startSocialLogin}><span aria-hidden="true">f</span>Continue with Facebook</a></div><p className="auth-switch">{registering?"Already registered?":"New customer?"} <Link to={registering?"/login":"/register"}>{registering?"Login":"Create an account"}</Link></p></section></main>;
}

function SocialAuthCallback({ onAuthenticated }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  useEffect(() => {
    api("/customer-auth/me")
      .then(({ customer }) => {
        onAuthenticated(customer);
        const returnTo = sessionStorage.getItem("sj_oauth_return_to") || "/account";
        sessionStorage.removeItem("sj_oauth_return_to");
        navigate(returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/account", { replace: true });
      })
      .catch((value) => setError(value.message));
  }, [navigate, onAuthenticated]);
  return <main className="auth-page"><section className="auth-card social-callback"><img src="/logo.png" alt="SJ Guppy Paradise"/>{error?<><h1>Sign-in failed</h1><p className="error">{error}</p><Link className="primary full" to="/login">Return to login</Link></>:<><span className="auth-spinner" aria-hidden="true"></span><h1>Signing you in…</h1><p>Securely connecting your customer account.</p></>}</section></main>;
}

function PaymentTracker({order}) {
  const status=order.paymentStatus||"pending";
  const steps=["pending","submitted","verified"];
  const position=status==="rejected"?1:Math.max(0,steps.indexOf(status));
  const labels={pending:"Awaiting payment",submitted:"Screenshot submitted",verified:"Payment verified",rejected:"Payment rejected"};
  return <div className={`payment-tracker ${status}`}><div className="payment-tracker-head"><b>{labels[status]}</b><span>{status}</span></div><div className="payment-track-steps">{steps.map((step,index)=><div className={index<=position?"done":""} key={step}><i>{index<position?"✓":index+1}</i><small>{step==="pending"?"Pay":step==="submitted"?"Review":"Verified"}</small></div>)}</div>{order.paymentProof?.submittedAt&&<small>Submitted: {new Date(order.paymentProof.submittedAt).toLocaleString()}</small>}{order.paymentTracking?.verifiedAt&&<small>Verified: {new Date(order.paymentTracking.verifiedAt).toLocaleString()}</small>}{order.paymentTracking?.rejectedAt&&<small>Rejected: {new Date(order.paymentTracking.rejectedAt).toLocaleString()}</small>}{order.paymentTracking?.adminNote&&<p>{order.paymentTracking.adminNote}</p>}{order.paymentProof?.url&&<a href={order.paymentProof.url} target="_blank" rel="noreferrer">View payment screenshot</a>}</div>;
}

function CustomerAccountContent({ customer, logout, onUpdated = () => window.location.reload() }) {
  const [orders,setOrders]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
  const [editing,setEditing]=useState(!customer.phone),[saving,setSaving]=useState(false),[saved,setSaved]=useState(false);
  const [form,setForm]=useState({name:customer.name,phone:customer.phone,avatar:null});
  const [preview,setPreview]=useState(customer.avatar?.url||"");
  const loadOrders=()=>api("/orders/mine").then(data=>setOrders(data.orders)).catch(value=>setError(value.message)).finally(()=>setLoading(false));
  useEffect(()=>{loadOrders();const timer=setInterval(loadOrders,10000);return()=>clearInterval(timer)},[]);
  const chooseAvatar=e=>{const file=e.target.files?.[0];if(!file)return;setForm(value=>({...value,avatar:file}));setPreview(URL.createObjectURL(file))};
  const cancelEdit=()=>{setEditing(false);setForm({name:customer.name,phone:customer.phone,avatar:null});setPreview(customer.avatar?.url||"")};
  const saveProfile=async e=>{e.preventDefault();setSaving(true);setError("");try{const body=new FormData();body.append("name",form.name);body.append("phone",form.phone);if(form.avatar)body.append("avatar",form.avatar);const data=await api("/customer-auth/profile",{method:"PATCH",body});onUpdated(data.customer);setForm({name:data.customer.name,phone:data.customer.phone,avatar:null});setPreview(data.customer.avatar?.url||"");setEditing(false);setSaved(true);setTimeout(()=>setSaved(false),2500)}catch(value){setError(value.message)}finally{setSaving(false)}};
  return <main className="page account-page profile-page"><section className="account-profile profile-card"><div className="profile-cover"></div><div className="profile-avatar-wrap">{preview?<img className="profile-avatar" src={preview} alt={`${customer.name} profile`}/>:<span className="profile-avatar profile-initial">{customer.name?.[0]||"U"}</span>}{editing&&<label className="avatar-edit" aria-label="Change profile photo">📷<input type="file" accept="image/*" onChange={chooseAvatar}/></label>}</div>{editing?<form className="profile-form" onSubmit={saveProfile}><label>Full name<input required minLength="2" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Phone / WhatsApp<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>Email<input value={customer.email} disabled/></label><div className="profile-actions"><button type="button" onClick={cancelEdit}>Cancel</button><button className="profile-save" disabled={saving}>{saving?"Saving…":"Save profile"}</button></div></form>:<><p className="eyebrow">CUSTOMER PROFILE</p><h1>{customer.name}</h1><p>{customer.email}</p><p>{customer.phone}</p><button className="profile-edit" onClick={()=>setEditing(true)}>Edit profile</button><button className="profile-logout" onClick={logout}>Logout</button></>}{saved&&<p className="profile-saved">Profile saved successfully ✓</p>}</section><section className="account-orders"><div className="orders-heading"><div><p className="eyebrow">ORDER HISTORY</p><h2>My enquiries</h2></div><Link to="/collection">Browse guppies</Link></div>{loading&&<p>Loading enquiries…</p>}{error&&<p className="error">{error}</p>}{!loading&&!orders.length&&<div className="account-empty"><p>You have not sent an enquiry yet.</p><Link className="primary" to="/collection">Explore guppies</Link></div>}{orders.map(order=><article key={order._id}><div><b>{order.orderNumber}</b><small>{new Date(order.createdAt).toLocaleDateString()}</small></div><div><span>{order.items.map(item=>`${item.name} · ${item.selectionType||"pair"} · ${item.totalFish||item.quantity} fish`).join(", ")}</span><strong>{money(order.total)}</strong></div><div><i className={`account-status ${order.status}`}>{order.status}</i><small>Payment: {order.paymentStatus||"pending"}</small></div></article>)}</section></main>;
}

function CustomerAccount(props) {
  const [orders,setOrders]=useState([]),[loading,setLoading]=useState(true),[refreshing,setRefreshing]=useState(false);
  const load=async()=>{setRefreshing(true);try{const data=await api("/orders/mine");setOrders(data.orders)}finally{setLoading(false);setRefreshing(false)}};
  useEffect(()=>{load();const timer=setInterval(load,10000);return()=>clearInterval(timer)},[]);
  return <div className="customer-account-layout"><CustomerAccountContent {...props}/><section className="page payment-tracking-page"><div className="payment-tracking-title"><div><p className="eyebrow">PAYMENT ACTIVITY</p><h1>Payment tracking</h1><p>Follow each payment from submission to verification.</p></div><button type="button" onClick={load} disabled={refreshing}>{refreshing?"Refreshing…":"↻ Refresh"}</button></div>{loading?<p>Loading payment tracking…</p>:!orders.length?<p className="account-empty">No payments to track yet.</p>:<div className="payment-tracking-grid">{orders.map(order=><article key={order._id}><div className="tracking-order-head"><div><b>{order.orderNumber}</b><small>{new Date(order.createdAt).toLocaleDateString()}</small></div><strong>{money(order.total)}</strong></div><PaymentTracker order={order}/></article>)}</div>}</section></div>;
}

function RequireCustomer({ customer, loading, children }) {
  const location = useLocation();
  if (loading) return <main className="page empty">Checking your account…</main>;
  return customer ? children : <Navigate to="/login" replace state={{ from: location.pathname }}/>;
}

function ChatWidget({ customer }) {
  const [open, setOpen] = useState(false), [chat, setChat] = useState(null), [text, setText] = useState(""), [actionMessage,setActionMessage] = useState(null);
  const messagesRef = useRef(null);
  const longPressRef = useRef(null);
  const ignoreNextTapRef = useRef(false);
  const sessionKey = customer ? `sj-chat-session:${customer.id}` : null;
  useEffect(() => { setChat(null); setText(""); setOpen(false); }, [customer?.id]);
  useEffect(() => { if (!open || !customer || chat) return; const saved = localStorage.getItem(sessionKey); api("/chat/session", { method:"POST", body:JSON.stringify({ sessionId:saved }) }).then(({chat:value}) => { setChat(value); localStorage.setItem(sessionKey, value.sessionId); }).catch(() => {}); }, [open, chat, customer?.id, sessionKey]);
  useEffect(() => { if (!customer || !chat || !["pending","accepted","active"].includes(chat.status)) return; const id = setInterval(() => api(`/chat/session/${chat.sessionId}`).then(({chat:value}) => setChat(value)).catch(()=>{}), 5000); return () => clearInterval(id); }, [customer?.id, chat?.sessionId, chat?.status]);
  useEffect(() => { const element=messagesRef.current; if(open&&element) element.scrollTop=element.scrollHeight; }, [open,chat?.messages?.length]);
  const send = async (e) => { e.preventDefault(); if (!text.trim() || !chat) return; const value=text; setText(""); const data=await api(`/chat/session/${chat.sessionId}/message`,{method:"POST",body:JSON.stringify({text:value})}); setChat(data.chat); };
  const editMessage = async (message) => { const value=window.prompt("Edit your message",message.text); if(value===null||!value.trim()||value.trim()===message.text)return; const data=await api(`/chat/session/${chat.sessionId}/message/${message._id}`,{method:"PATCH",body:JSON.stringify({text:value.trim()})}); setChat(data.chat); };
  const deleteMessage = async (message) => { if(!window.confirm("Delete this message permanently?"))return; const data=await api(`/chat/session/${chat.sessionId}/message/${message._id}`,{method:"DELETE"}); setChat(data.chat); };
  const beginLongPress = (message) => { if(message.sender!=="customer")return; clearTimeout(longPressRef.current); longPressRef.current=setTimeout(()=>{ignoreNextTapRef.current=true;setActionMessage(message._id)},550); };
  const cancelLongPress = () => clearTimeout(longPressRef.current);
  const dismissMessageActions = () => { if(ignoreNextTapRef.current){ignoreNextTapRef.current=false;return} setActionMessage(null); };
  const requestAdmin = async () => { if (!chat) return; const data=await api(`/chat/session/${chat.sessionId}/request-admin`,{method:"POST",body:"{}"}); setChat(data.chat); };
  return <div className="chat"><button className="chat-toggle" onClick={() => {setOpen(!open);setActionMessage(null)}} aria-label="Open chat">{open ? "×" : "Chat"}</button>{open && <section className="chat-panel"><header><div><b>Paradise assistant</b><small>{customer?(chat?.status === "ai" ? `Private chat for ${customer.name}` : `Status: ${chat?.status || "connecting"}`):"Customer login required"}</small></div></header>{!customer?<div className="messages"><p>This chat is private for each customer. Please login or register to start your conversation.</p><Link className="primary" to="/login" onClick={()=>setOpen(false)}>Customer login</Link></div>:<><div className="messages" ref={messagesRef} onClick={dismissMessageActions}>{chat?.messages?.map((message) => <p key={message._id} className={`${message.sender}${actionMessage===message._id?" actions-visible":""}`} onPointerDown={()=>beginLongPress(message)} onPointerUp={cancelLongPress} onPointerCancel={cancelLongPress} onPointerLeave={cancelLongPress} onContextMenu={e=>{if(message.sender!=="customer")return;e.preventDefault();ignoreNextTapRef.current=false;setActionMessage(message._id)}}><small>{message.sender}</small><span>{message.text}</span>{message.mediaUrl&&<a href={message.mediaUrl} target="_blank" rel="noreferrer"><img className="chat-proof" src={message.mediaUrl} alt={`Payment proof ${message.orderNumber||""}`}/></a>}{message.sender==="customer"&&actionMessage===message._id&&<span className="message-actions" onClick={e=>e.stopPropagation()}><button type="button" onClick={()=>editMessage(message)}>Edit</button><button type="button" onClick={()=>deleteMessage(message)}>Delete</button></span>}</p>) || <p>Starting your private chat…</p>}</div><form className="chat-input" onSubmit={send}><input disabled={!chat} value={text} onChange={(e)=>setText(e.target.value)} placeholder="Type your question"/><button disabled={!chat}>Send</button></form>{chat?.status === "ai" && <button className="human" onClick={requestAdmin}>Request the breeder</button>}</>}</section>}</div>;
}

export default function App() {
  const [fish, setFish] = useState(demoFish), [cart, setCart] = useState([]), [settings, setSettings] = useState({});
  const [customer, setCustomer] = useState(null), [authLoading, setAuthLoading] = useState(true);
  const [enquiryNotice,setEnquiryNotice] = useState(null);
  const noticeTimer = useRef(null);
  useEffect(() => { api("/fish").then((data) => setFish(data.fish)).catch(() => setFish(demoFish)); api("/customer-auth/me").then(data=>setCustomer(data.customer)).catch(()=>setCustomer(null)).finally(()=>setAuthLoading(false)); }, []);
  useEffect(() => { const loadSettings=()=>api("/settings").then(data=>setSettings(data.settings)).catch(()=>{}); loadSettings(); window.addEventListener("focus",loadSettings); const interval=setInterval(loadSettings,30000); return()=>{window.removeEventListener("focus",loadSettings);clearInterval(interval)}; }, []);
  const add = (item) => {
    const alreadyAdded=cart.some(entry=>entry._id===item._id);
    if(!alreadyAdded) setCart(items=>[...items,{...item,availableQuantity:item.quantity,orderQuantity:1,selectionType:item.sex==="pair"?"pair":"custom",fishPerPack:item.sex==="pair"?2:1}]);
    setEnquiryNotice({name:item.name,alreadyAdded});
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current=window.setTimeout(()=>setEnquiryNotice(null),3500);
  };
  const updateItem = (id, changes) => setCart(items=>items.map(item=>item._id===id?{...item,...changes}:item));
  const logout = async () => { await api("/customer-auth/logout", { method: "POST" }).catch(()=>{}); setCustomer(null); };
  return <><ScrollToTop/><Header cartCount={cart.length} customer={customer} logout={logout} settings={settings}/>{enquiryNotice&&<div className="enquiry-toast" role="status" aria-live="polite"><span>✓</span><div><b>{enquiryNotice.alreadyAdded?"Already in enquiry":"Added to enquiry"}</b><small>{enquiryNotice.name}</small></div><Link to="/enquiry" onClick={()=>setEnquiryNotice(null)}>View</Link><button type="button" onClick={()=>setEnquiryNotice(null)} aria-label="Dismiss notification">×</button></div>}<Routes><Route path="/" element={<Home fish={fish} add={add} settings={settings}/>}/><Route path="/collection" element={<Collection fish={fish} add={add}/>}/><Route path="/fish/:slug" element={<FishDetails fish={fish} add={add}/>}/><Route path="/privacy" element={<PrivacyPolicy/>}/><Route path="/data-deletion" element={<DataDeletion/>}/><Route path="/login" element={customer?<Navigate to="/account" replace/>:<CustomerAuth mode="login" onAuthenticated={setCustomer}/>}/><Route path="/register" element={customer?<Navigate to="/account" replace/>:<CustomerAuth mode="register" onAuthenticated={setCustomer}/>}/><Route path="/auth/callback" element={<SocialAuthCallback onAuthenticated={setCustomer}/>}/><Route path="/account" element={<RequireCustomer customer={customer} loading={authLoading}><CustomerAccount customer={customer} logout={logout}/></RequireCustomer>}/><Route path="/enquiry" element={<RequireCustomer customer={customer} loading={authLoading}><Enquiry customer={customer} settings={settings} cart={cart} updateItem={updateItem} remove={(id)=>setCart(cart.filter((item)=>item._id!==id))} clear={()=>setCart([])}/></RequireCustomer>}/><Route path="*" element={<main className="page empty"><h1>Page not found</h1><Link to="/">Go home</Link></main>}/></Routes><Footer settings={settings}/><ChatWidget customer={customer}/></>;
}
