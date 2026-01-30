import { createClient } from "@supabase/supabase-js"
import { OpenRouter } from "@openrouter/sdk";

const privateKey = import.meta.env.VITE_SUPABASE_API_KEY;
if (!privateKey) throw new Error(`Expected env var VITE_SUPABASE_API_KEY`);
const url = import.meta.env.VITE_SUPABASE_URL;
if (!url) throw new Error(`Expected env var VITE_SUPABASE_URL`);
export const supabase = createClient(url, privateKey);


const openrouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY

export const openrouter = new OpenRouter({
    apiKey: openrouterApiKey
})
