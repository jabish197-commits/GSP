import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "./services/api.js";
import "./styles.css";
import "./chat-fixes.css";
import "./media-manager.css";
import "./mobile-fixes.css";

const emptyFish = { name:"", strain:"", description:"", price:"", quantity:1, sex:"pair", age:"", status:"available", featured:false, media:[] };
const money = (value) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(value||0);

function MediaAttachmentList({media=[],onRemove}) {
  if (!media.length) return null;
  return <div className="wide media-attachment-list">
    <p>Attached images and videos</p>
    <div>{media.map((item,index)=><article key={item.publicId||item.url||index}>
      {item.type==="video"?<video src={item.url} controls muted playsInline preload="metadata"/>:<img src={item.url} alt={item.alt||`Fish image ${index+1}`}/>} 
      <span>{item.type==="video"?"Video":"Image"} {index+1}</span>
      <button type="button" onClick={()=>{if(window.confirm(`Remove this ${item.type||"file"}?`))onRemove(index)}}>Remove</button>
    </article>)}</div>
    <small>Click Save listing to permanently remove selected files.</small>
  </div>;
}

function MediaViewer({media,onClose}) {
  if (!media?.url) return null;
  return <div className="media-viewer-backdrop" role="dialog" aria-modal="true" aria-label="Fish media preview" onClick={onClose}>
    <section className="media-viewer" onClick={event=>event.stopPropagation()}>
      <header><b>{media.type==="video"?"Video preview":"Image preview"}</b><button type="button" onClick={onClose} aria-label="Close preview">×</button></header>
      {media.type==="video"?<video key={media.url} src={media.url} controls autoPlay playsInline preload="auto"/>:<img src={media.url} alt="Fish preview"/>}
      <small>Use the player fullscreen button to view the original uploaded size.</small>
    </section>
  </div>;
}

function Login({ onLogin }) {
  const [form,setForm]=useState({email:"",password:""}),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const submit=async(e)=>{e.preventDefault();setBusy(true);setError("");try{const data=await api("/auth/login",{method:"POST",body:JSON.stringify(form)});onLogin(data.admin)}catch(err){setError(err.message)}finally{setBusy(false)}};
  return <main className="login"><section><img src="/logo.png" alt="SJ Guppy Paradise"/><p className="kicker">PRIVATE ADMINISTRATION</p><h1>Welcome back.</h1><p>Manage fish, enquiries, media, and customer conversations.</p><form onSubmit={submit}><label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>{error&&<p className="alert">{error}</p>}<button disabled={busy}>{busy?"Signing in…":"Sign in securely"}</button></form></section><aside><blockquote>“Healthy fish. Clear information. Personal breeder support.”</blockquote><small>SJ Guppy Paradise</small></aside></main>;
}

function Shell({admin,onLogout}) {
  const [tab,setTab]=useState("dashboard"),[fish,setFish]=useState([]),[orders,setOrders]=useState([]),[chats,setChats]=useState([]),[settings,setSettings]=useState({}),[error,setError]=useState("");
  const load=async()=>{setError("");try{const [f,o,c,s]=await Promise.all([api("/fish"),api("/orders"),api("/chat/admin"),api("/settings")]);setFish(f.fish);setOrders(o.orders);setChats(c.chats);setSettings(s.settings)}catch(e){setError(e.message)}};
  useEffect(()=>{load()},[]);
  const pending=chats.filter(c=>c.status==="pending").length, available=fish.filter(f=>f.status==="available").length, newOrders=orders.filter(o=>o.status==="new").length;
  const labels={dashboard:"Overview",fish:"Fish catalogue",orders:"Customer enquiries",chat:"Chat requests",settings:"Site settings"};
  const logout=async()=>{await api("/auth/logout",{method:"POST"}).catch(()=>{});onLogout()};
  return <div className="admin-shell"><aside className="sidebar"><div className="admin-brand"><img src="/logo.png" alt=""/><span><b>SJ GUPPY</b><small>ADMIN PANEL</small></span></div><nav>{Object.entries(labels).map(([key,label])=><button key={key} className={tab===key?"active":""} onClick={()=>setTab(key)}><span>{key==="dashboard"?"◫":key==="fish"?"◇":key==="orders"?"▤":key==="chat"?"◌":"⚙"}</span>{label}{key==="chat"&&pending>0?<b>{pending}</b>:null}</button>)}</nav><button className="logout" onClick={logout}>Sign out</button></aside><main className="admin-main"><header><div><p className="kicker">SJ GUPPY PARADISE</p><h1>{labels[tab]}</h1></div><div className="admin-user"><span>{admin.name?.[0]}</span><div><b>{admin.name}</b><small>{admin.email}</small></div></div></header>{error&&<p className="alert">{error}</p>}{tab==="dashboard"&&<Dashboard fish={fish} orders={orders} pending={pending} available={available} newOrders={newOrders} setTab={setTab}/>} {tab==="fish"&&<FishManager fish={fish} reload={load}/>} {tab==="orders"&&<Orders orders={orders} reload={load}/>} {tab==="chat"&&<Chats chats={chats} reload={load}/>} {tab==="settings"&&<Settings settings={settings} setSettings={setSettings}/>}</main></div>;
}

function Dashboard({fish,orders,pending,available,newOrders,setTab}) { const revenue=orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+o.total,0); return <><section className="stats"><article><small>Available listings</small><strong>{available}</strong><button onClick={()=>setTab("fish")}>Manage catalogue →</button></article><article><small>New enquiries</small><strong>{newOrders}</strong><button onClick={()=>setTab("orders")}>Review enquiries →</button></article><article className={pending?"attention":""}><small>Waiting chats</small><strong>{pending}</strong><button onClick={()=>setTab("chat")}>Open chat desk →</button></article><article><small>Enquiry value</small><strong>{money(revenue)}</strong><span>Before confirmation</span></article></section><section className="panel"><div className="panel-head"><div><p className="kicker">LATEST ACTIVITY</p><h2>Recent enquiries</h2></div><button onClick={()=>setTab("orders")}>View all</button></div><OrderTable orders={orders.slice(0,5)}/></section><section className="quick"><div><p className="kicker">CATALOGUE HEALTH</p><h2>{fish.length ? `${available} of ${fish.length} listings are available` : "Start your catalogue"}</h2><p>Keep quantities and statuses current so the AI assistant never promises unavailable fish.</p></div><button onClick={()=>setTab("fish")}>Add or update fish</button></section></> }

function FishManager({fish,reload}) { const [editing,setEditing]=useState(null),[form,setForm]=useState(emptyFish),[busy,setBusy]=useState(false),[uploading,setUploading]=useState(false),[preview,setPreview]=useState(null); const open=(item=emptyFish)=>{setEditing(item._id||"new");setForm({...emptyFish,...item})}; const upload=async(file)=>{if(!file)return;setUploading(true);try{const body=new FormData();body.append("file",file);const data=await api("/media",{method:"POST",body});setForm(v=>({...v,media:[...(v.media||[]),data.media]}))}finally{setUploading(false)}}; const save=async(e)=>{e.preventDefault();setBusy(true);const body={...form,price:Number(form.price),quantity:Number(form.quantity)};try{await api(editing==="new"?"/fish":`/fish/${editing}`,{method:editing==="new"?"POST":"PUT",body:JSON.stringify(body)});setEditing(null);await reload()}finally{setBusy(false)}}; const remove=async(id)=>{if(!confirm("Delete this fish listing?"))return;await api(`/fish/${id}`,{method:"DELETE"});reload()}; return <section className="panel"><div className="panel-head"><div><p className="kicker">LIVE CONTENT</p><h2>Fish listings</h2></div><button className="main-action" onClick={()=>open()}>+ Add guppy</button></div><div className="fish-admin-grid">{fish.map(item=><article key={item._id}><div className="thumb">{item.media?.[0]?.url ? (item.media[0].type === "video" ? <video src={item.media[0].url} muted controls playsInline preload="auto"/> : <img src={item.media[0].url} alt={item.name}/>) : <span>SJ</span>}<i className={item.status}>{item.status}</i><div className="thumb-actions"><button type="button" onClick={()=>setPreview(item.media?.[0])}>View</button><button type="button" onClick={()=>open(item)}>Edit</button><button type="button" className="danger" onClick={()=>remove(item._id)}>Delete</button></div></div><div><small>{item.strain}</small><h3>{item.name}</h3><b>{money(item.price)}</b><p>{item.quantity} available · {item.sex}</p></div></article>)}</div>{editing&&<div className="modal-backdrop"><form className="fish-form" onSubmit={save}><div className="panel-head"><h2>{editing==="new"?"Add guppy":"Edit guppy"}</h2><button type="button" onClick={()=>setEditing(null)}>×</button></div><div className="form-grid"><label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Strain<input required value={form.strain} onChange={e=>setForm({...form,strain:e.target.value})}/></label><label>Price (₹)<input required type="number" min="0" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label>Quantity<input required type="number" min="0" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/></label><label>Selection<select value={form.sex} onChange={e=>setForm({...form,sex:e.target.value})}><option>pair</option><option>male</option><option>female</option><option>juvenile</option><option>mixed</option></select></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>available</option><option>reserved</option><option>sold</option></select></label><label>Age<input value={form.age||""} onChange={e=>setForm({...form,age:e.target.value})}/></label><label className="check"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Feature on homepage</label><label className="wide">Description<textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label className="wide upload">Images or videos<input type="file" accept="image/*,video/*" onChange={e=>upload(e.target.files[0])}/><span>{uploading?"Uploading…":`${form.media?.length||0} files attached`}</span></label><MediaAttachmentList media={form.media} onRemove={index=>setForm(value=>({...value,media:value.media.filter((_,itemIndex)=>itemIndex!==index)}))}/></div><button className="main-action full" disabled={busy||uploading}>{busy?"Saving…":"Save listing"}</button></form></div>}{preview&&<MediaViewer media={preview} onClose={()=>setPreview(null)}/>}</section> }

function OrderTable({orders,update,updatePayment}) {
  return <div className="table-wrap"><table><thead><tr><th>Reference</th><th>Customer</th><th>Items</th><th>Value</th><th>Order</th><th>Payment</th>{update&&<th>Actions</th>}</tr></thead><tbody>{orders.map(order=><tr key={order._id}><td><b>{order.orderNumber}</b><small>{new Date(order.createdAt).toLocaleDateString()}</small></td><td>{order.customer.name}<small>{order.customer.phone}</small></td><td>{order.items.map(i=>`${i.name} · ${i.selectionType||"pair"} · ${i.totalFish||i.quantity} fish`).join(", ")}</td><td>{money(order.total)}</td><td>{update?<select value={order.status} onChange={e=>update(order._id,e.target.value)}>{["new","confirmed","preparing","shipped","completed","cancelled"].map(s=><option key={s}>{s}</option>)}</select>:<i className={order.status}>{order.status}</i>}</td><td><i className={order.paymentStatus||"pending"}>{order.paymentStatus||"pending"}</i>{order.paymentProof?.url&&<small><a href={order.paymentProof.url} target="_blank" rel="noreferrer" style={{color:"var(--blue)",fontWeight:700}}>View screenshot</a></small>}{updatePayment&&order.paymentStatus==="submitted"&&<div style={{display:"flex",gap:4,marginTop:6}}><button onClick={()=>updatePayment(order._id,"verified")}>Verify</button><button className="danger" onClick={()=>updatePayment(order._id,"rejected")}>Reject</button></div>}</td>{update&&<td>{order.status==="new"?<button onClick={()=>update(order._id,"confirmed")} style={{border:0,borderRadius:7,padding:".65rem .9rem",background:"var(--orange)",color:"white",fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>Accept request</button>:<span style={{color:"#087353",fontWeight:700}}>{order.status==="confirmed"?"Accepted":""}</span>}</td>}</tr>)}{!orders.length&&<tr><td colSpan={update?"7":"6"}>No enquiries yet.</td></tr>}</tbody></table></div>;
}
function Orders({orders,reload}) {const update=async(id,status)=>{await api(`/orders/${id}/status`,{method:"PATCH",body:JSON.stringify({status})});reload()};const updatePayment=async(id,paymentStatus)=>{const label=paymentStatus==="verified"?"Optional verification note":"Reason for rejection (shown to customer)";const adminNote=window.prompt(label,"");if(adminNote===null)return;await api(`/orders/${id}/payment-status`,{method:"PATCH",body:JSON.stringify({paymentStatus,adminNote})});reload()};return <section className="panel"><div className="panel-head"><div><p className="kicker">CUSTOMER REQUESTS</p><h2>All enquiries</h2></div></div><OrderTable orders={orders} update={update} updatePayment={updatePayment}/></section>}

function Chats({chats,reload}) {
  const [selected,setSelected]=useState(null),[text,setText]=useState(""),[refreshing,setRefreshing]=useState(false),[refreshed,setRefreshed]=useState(false),[actionMessage,setActionMessage]=useState(null);
  const messagesRef=useRef(null);
  const longPressRef=useRef(null);
  const ignoreNextTapRef=useRef(false);
  const current=useMemo(()=>selected?chats.find(c=>c._id===selected)||null:null,[chats,selected]);

  useEffect(()=>{
    const messages=messagesRef.current;
    if(messages) messages.scrollTop=messages.scrollHeight;
  },[current?._id,current?.messages?.length]);

  const status=async(value)=>{
    await api(`/chat/admin/${current._id}/status`,{method:"PATCH",body:JSON.stringify({status:value})});
    reload();
  };
  const refresh=async()=>{
    if(refreshing) return;
    setRefreshing(true);
    setRefreshed(false);
    try {
      await reload();
      setRefreshed(true);
      setTimeout(()=>setRefreshed(false),1800);
    } finally {
      setRefreshing(false);
    }
  };
  const send=async(e)=>{
    e.preventDefault();
    if(!text.trim()) return;
    await api(`/chat/admin/${current._id}/message`,{method:"POST",body:JSON.stringify({text})});
    setText("");
    reload();
  };
  const editMessage=async(message)=>{
    const value=window.prompt("Edit admin reply",message.text);
    if(value===null||!value.trim()||value.trim()===message.text) return;
    await api(`/chat/admin/${current._id}/message/${message._id}`,{method:"PATCH",body:JSON.stringify({text:value.trim()})});
    await reload();
  };
  const deleteMessage=async(message)=>{
    if(!window.confirm("Delete this admin reply permanently?")) return;
    await api(`/chat/admin/${current._id}/message/${message._id}`,{method:"DELETE"});
    await reload();
  };
  const beginLongPress=(message)=>{
    if(message.sender!=="admin") return;
    clearTimeout(longPressRef.current);
    longPressRef.current=setTimeout(()=>{
      ignoreNextTapRef.current=true;
      setActionMessage(message._id);
    },550);
  };
  const cancelLongPress=()=>clearTimeout(longPressRef.current);
  const dismissMessageActions=()=>{
    if(ignoreNextTapRef.current){
      ignoreNextTapRef.current=false;
      return;
    }
    setActionMessage(null);
  };
  const closeChatView=()=>{cancelLongPress();setActionMessage(null);setSelected(null)};

  return <section className={`chat-desk${current?" chat-open":""}`}>
    <aside>
      <div className="panel-head chat-list-head"><div><h2>Conversations</h2>{refreshed&&<small className="refresh-success">Updated ✓</small>}</div><button type="button" className="refresh-chats" onClick={refresh} disabled={refreshing} aria-label="Refresh conversations">{refreshing?"Refreshing…":"↻ Refresh"}</button></div>
      {chats.map(c=><button key={c._id} className={current?._id===c._id?"selected":""} onClick={()=>{setSelected(c._id);setActionMessage(null)}}><span>{c.customerName?.[0]||"G"}</span><div><b>{c.customerName}</b><small>{c.messages.at(-1)?.text}</small></div><i className={c.status}>{c.status}</i></button>)}
      {!chats.length&&<p>No chats yet.</p>}
    </aside>
    <main>{current?<>
      <header><div className="selected-chat-info"><h2>{current.customerName}</h2><p>{current.customerPhone||"No phone shared"} · {current.status}</p></div><div className="chat-status-actions">{current.status==="pending"&&<button className="chat-primary-action" onClick={()=>status("accepted")}>Accept request</button>}{["accepted","active"].includes(current.status)&&<span className="accepted-label">✓ Accepted / Active</span>}{current.status==="closed"?<button className="chat-primary-action" onClick={()=>status("accepted")}>Accept / Reopen</button>:current.status!=="pending"&&<button className="chat-secondary-action" onClick={()=>status("closed")}>End chat</button>}<button type="button" className="chat-view-close" onClick={closeChatView} aria-label="Close chat view" title="Close chat view">×</button></div></header>
      <div className="admin-messages" ref={messagesRef} onClick={dismissMessageActions}>{current.messages.map(m=><p key={m._id} className={`${m.sender}${actionMessage===m._id?" actions-visible":""}`} onPointerDown={()=>beginLongPress(m)} onPointerUp={cancelLongPress} onPointerCancel={cancelLongPress} onPointerLeave={cancelLongPress} onContextMenu={e=>{if(m.sender!=="admin")return;e.preventDefault();ignoreNextTapRef.current=false;setActionMessage(m._id)}}><small>{m.sender}</small><span>{m.text}</span>{m.mediaUrl&&<a href={m.mediaUrl} target="_blank" rel="noreferrer"><img src={m.mediaUrl} alt={`Payment proof ${m.orderNumber||""}`}/></a>}{m.sender==="admin"&&actionMessage===m._id&&<span className="message-actions" onClick={e=>e.stopPropagation()}><button type="button" onClick={()=>editMessage(m)}>Edit</button><button type="button" onClick={()=>deleteMessage(m)}>Delete</button></span>}</p>)}</div>
      <form className="admin-reply-form" onSubmit={send}><input disabled={current.status==="closed"} value={text} onChange={e=>setText(e.target.value)} placeholder={current.status==="closed"?"Reopen this chat to reply":"Type your reply…"} enterKeyHint="send"/><button disabled={current.status==="closed"}>Send</button></form>
    </>:<div className="no-selection"><b>Select a conversation</b><small>Press and hold an admin message to edit or delete it.</small></div>}</main>
  </section>;
}

function Settings({settings,setSettings}) {
  const [saved,setSaved]=useState(false),[uploadingQr,setUploadingQr]=useState(false);
  const save=async(e)=>{e.preventDefault();const data=await api("/settings",{method:"PUT",body:JSON.stringify(settings)});setSettings(data.settings);setSaved(true);setTimeout(()=>setSaved(false),2500)};
  const uploadQr=async(file)=>{if(!file)return;setUploadingQr(true);try{const body=new FormData();body.append("file",file);const data=await api("/media",{method:"POST",body});const next={...settings,paymentQr:{url:data.media.url,publicId:data.media.publicId}};const savedData=await api("/settings",{method:"PUT",body:JSON.stringify(next)});setSettings(savedData.settings);setSaved(true);setTimeout(()=>setSaved(false),2500)}finally{setUploadingQr(false)}};
  return <section className="panel settings"><div className="panel-head"><div><p className="kicker">PUBLIC INFORMATION & PAYMENT</p><h2>Site settings</h2></div>{saved&&<span className="saved">Saved ✓</span>}</div><form onSubmit={save}><label>Homepage headline<input value={settings.heroTitle||""} onChange={e=>setSettings({...settings,heroTitle:e.target.value})}/></label><label>Homepage introduction<textarea value={settings.heroSubtitle||""} onChange={e=>setSettings({...settings,heroSubtitle:e.target.value})}/></label><div className="form-grid"><label>Phone<input value={settings.phone||""} onChange={e=>setSettings({...settings,phone:e.target.value})}/></label><label>WhatsApp number<input value={settings.whatsapp||""} onChange={e=>setSettings({...settings,whatsapp:e.target.value})}/></label><label>Email<input type="email" value={settings.email||""} onChange={e=>setSettings({...settings,email:e.target.value})}/></label><label>Location<input value={settings.location||""} onChange={e=>setSettings({...settings,location:e.target.value})}/></label><label className="wide">Instagram profile<input type="text" placeholder="@username or https://www.instagram.com/username/" value={settings.instagramUrl||""} onChange={e=>setSettings({...settings,instagramUrl:e.target.value})}/><span>Customers will see this link in the menu and footer.</span></label></div><label>Delivery note<textarea value={settings.deliveryNote||""} onChange={e=>setSettings({...settings,deliveryNote:e.target.value})}/></label><div style={{padding:"1.5rem",border:"1px solid #cfe0de",borderRadius:12,background:"#f7fbfa"}}><p className="kicker">GPAY / PHONEPE QR</p><div className="form-grid"><label>Payment receiver name<input value={settings.paymentName||""} onChange={e=>setSettings({...settings,paymentName:e.target.value})}/></label>
<label>UPI ID<input required placeholder="yourname@bank" value={settings.upiId||""} onChange={e=>setSettings({...settings,upiId:e.target.value.trim()})}/><span>Opens UPI apps with the exact order amount.</span></label>
<label>Upload QR code<input type="file" accept="image/*" onChange={e=>uploadQr(e.target.files[0])}/><span>{uploadingQr?"Uploading QR…":settings.paymentQr?.url?"QR uploaded":"Choose QR image"}</span></label></div>{settings.paymentQr?.url&&<img src={settings.paymentQr.url} alt="Payment QR preview" style={{width:220,maxWidth:"100%",margin:"1rem 0",borderRadius:10,border:"1px solid #ccd"}}/>}<label>Payment instructions<textarea value={settings.paymentInstructions||""} onChange={e=>setSettings({...settings,paymentInstructions:e.target.value})}/></label></div><button className="main-action" disabled={uploadingQr}>Save public information and payment QR</button>{saved&&<div className="save-success" role="status" aria-live="polite"><span>✓</span><div><b>Saved successfully</b><small>Your public website information has been updated.</small></div></div>}</form></section>;
}

export default function App(){const[admin,setAdmin]=useState(null),[checking,setChecking]=useState(true);useEffect(()=>{api("/auth/me").then(d=>setAdmin(d.admin)).catch(()=>{}).finally(()=>setChecking(false))},[]);if(checking)return <div className="loading"><img src="/logo.png" alt=""/><p>Opening admin panel…</p></div>;return admin?<Shell admin={admin} onLogout={()=>setAdmin(null)}/>:<Login onLogin={setAdmin}/>}
