import { InferenceClient } from "@huggingface/inference"

export const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
export const AMADEUS_API_KEY = import.meta.env.VITE_AMADEUS_API_KEY
export const AMADEUS_SECRET = import.meta.env.VITE_AMADEUS_SECRET

export const hf = new InferenceClient(import.meta.env.VITE_HF_TOKEN)


export const getAmadeusToken = async () => {
    const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: AMADEUS_API_KEY,
                client_secret: AMADEUS_SECRET
            })
        }
    )

    const data = await res.json()
    return data.access_token
}
