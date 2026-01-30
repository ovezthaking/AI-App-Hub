import { createClient } from "@supabase/supabase-js"
import { OpenRouter } from "@openrouter/sdk";
import { InferenceClient } from "@huggingface/inference";

const privateKey = import.meta.env.VITE_VECTOR_SUPABASE_API_KEY;
if (!privateKey) throw new Error(`Expected env var VITE_SUPABASE_API_KEY`);
const url = import.meta.env.VITE_VECTOR_SUPABASE_URL;
if (!url) throw new Error(`Expected env var VITE_SUPABASE_URL`);
export const supabase = createClient(url, privateKey);

const openrouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY

export const openrouter = new OpenRouter({
    apiKey: openrouterApiKey
})

export const hf = new InferenceClient(import.meta.env.VITE_HF_TOKEN)
