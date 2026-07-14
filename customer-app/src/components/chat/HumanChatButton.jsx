export default function HumanChatButton({ status = "ai", onClick }) { if(status!=="ai") return null; return <button className="human" onClick={onClick}>Request the breeder</button>; }
