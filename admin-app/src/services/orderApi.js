import{api}from"./api.js";export const listOrders=()=>api("/orders");export const updateOrderStatus=(id,status)=>api(`/orders/${id}/status`,{method:"PATCH",body:JSON.stringify({status})});
