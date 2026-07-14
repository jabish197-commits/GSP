export function configureSocket(io){io.on("connection",socket=>{socket.on("join-chat",sessionId=>socket.join(`chat:${sessionId}`));socket.on("join-admin",()=>socket.join("admins"))});return io}
