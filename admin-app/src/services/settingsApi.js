import{api}from"./api.js";export const getSettings=()=>api("/settings");export const updateSettings=body=>api("/settings",{method:"PUT",body:JSON.stringify(body)});
