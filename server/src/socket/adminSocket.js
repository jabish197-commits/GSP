export default function adminSocket(_io,socket){socket.on("join-admin",()=>socket.join("admins"))}
