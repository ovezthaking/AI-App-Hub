import { InferenceClient } from "@huggingface/inference"

export const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
export const AMADEUS_API_KEY = import.meta.env.VITE_AMADEUS_API_KEY
export const AMADEUS_SECRET = import.meta.env.VITE_AMADEUS_SECRET

export const hf = new InferenceClient(import.meta.env.VITE_HF_TOKEN)