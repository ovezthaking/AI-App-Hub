import { createClient } from "@supabase/supabase-js"
import { InferenceClient } from "@huggingface/inference";

const privateKey = import.meta.env.VITE_LANGCHAIN_SUPABASE_API_KEY;
if (!privateKey) throw new Error(`Expected env var VITE_SUPABASE_API_KEY`);
const url = import.meta.env.VITE_LANGCHAIN_SUPABASE_URL;
if (!url) throw new Error(`Expected env var VITE_SUPABASE_URL`);
export const supabase = createClient(url, privateKey);

export const hf = new InferenceClient(import.meta.env.VITE_HF_TOKEN)
