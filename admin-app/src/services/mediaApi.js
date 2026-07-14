import{api}from"./api.js";export const uploadMedia=file=>{const body=new FormData();body.append("file",file);return api("/media",{method:"POST",body})};
