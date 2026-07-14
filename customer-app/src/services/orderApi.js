import{api}from"./api.js";export const createOrder=body=>api("/orders",{method:"POST",body:JSON.stringify(body)});
