// src/api.js
// Se estiver na internet (Vercel), usa o link do Render.
// Se estiver no seu PC, usa localhost:3000.
const API_URL = import.meta.env.VITE_API_URL || 'https://tamura-api.onrender.com';

export default API_URL;