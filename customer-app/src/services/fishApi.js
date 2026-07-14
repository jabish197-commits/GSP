import{api}from"./api.js";export const getFish=(params={})=>api(`/fish?${new URLSearchParams(params)}`);export const getFishByIdOrSlug=value=>api(`/fish/${value}`);
