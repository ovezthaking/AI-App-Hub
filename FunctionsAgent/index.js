import { InferenceClient } from "@huggingface/inference";
import { getCurrentWeather, getLocation, tools } from "./tools";


const hf = new InferenceClient(import.meta.env.VITE_HF_TOKEN)

const availableFunctions = {
    getCurrentWeather,
    getLocation
}


async function agent(query) {
    const messages = [
        {
            role: 'system',
            content: "You are a helpful AI AgentYou are a helpful AI agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers."
        },
        {
            role: 'user',
            content: query
        }
    ]

    const MAX_ITERATIONS = 5

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        // console.log(`Iteration #${i+1}`)
        const response = await hf.chatCompletion({
            model: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
            messages,
            tools
        })

        // const responseText = response.choices[0].message.content
        console.log(response)

        // Check finish reason
        // If "stop"
            // return result
        // else if "tool_calls"
            // call functions
            // append results
            // continue
    }
}

console.log(await agent('Jaka jest moja obecna lokalizacja?'))


/**
 * Goal - build an agent that can answer any questions that might require knowledge 
 * about my current location and the current weather at my location.
 */
