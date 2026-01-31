import { InferenceClient } from "@huggingface/inference";
import { createClient } from "@supabase/supabase-js";

const hfToken = import.meta.env.VITE_HF_TOKEN
if (!hfToken) throw new Error('Expected env var VITE_HF_TOKEN')
export const hf = new InferenceClient(hfToken)

const privateKey = import.meta.env.VITE_SUPABASE_API_KEY;
if (!privateKey) throw new Error(`Expected env var VITE_SUPABASE_API_KEY`);
const url = import.meta.env.VITE_SUPABASE_URL;
if (!url) throw new Error(`Expected env var VITE_SUPABASE_URL`);
export const supabase = createClient(url, privateKey);
