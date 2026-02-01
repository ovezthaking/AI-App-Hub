import { InferenceClient } from "@huggingface/inference";


const hf = new InferenceClient(import.meta.env.VITE_HF_TOKEN)

const response = await hf.chatCompletion({
    model: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
    messages: [
        {
            role: 'user',
            content: 'Give me a list of activity ideas based on my current location and weather'
        }
    ]
})


console.log(response.choices[0].message.content)

/**
 * Goal - build an agent that can get the current weather at my current location
 * and give me some localized ideas of activities I can do.
 */
