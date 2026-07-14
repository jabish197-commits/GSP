import{z}from"zod";export const chatMessageSchema=z.object({body:z.object({text:z.string().trim().min(1).max(2000)}),params:z.object({sessionId:z.string().min(8)}),query:z.object({})});
