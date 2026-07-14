export const imageUrl=(media,fallback="/placeholder-fish.png")=>media?.find(item=>item.type==="image")?.url||fallback;
