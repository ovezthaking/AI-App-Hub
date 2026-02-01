import { InferenceClient } from "@huggingface/inference";
import { getCurrentWeather, getLocation } from "./tools";


const hf = new InferenceClient(import.meta.env.VITE_HF_TOKEN)

// Call a function to get current location and current weather

const weather = await getCurrentWeather()
const location = await getLocation()

const response = await hf.chatCompletion({
    model: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
    messages: [
        {
            role: 'user',
            content: `Give me a list of activity ideas based on my current location of ${location} and weather of ${weather}`
        }
    ]
})


console.log(response.choices[0].message.content)

/**
 * Goal - build an agent that can get the current weather at my current location
 * and give me some localized ideas of activities I can do.
 */
