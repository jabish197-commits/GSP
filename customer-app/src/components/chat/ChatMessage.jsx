export default function ChatMessage({ message }) { return <p className={message.sender}><small>{message.sender}</small>{message.text}</p>; }
