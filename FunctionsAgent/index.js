import { InferenceClient } from "@huggingface/inference";
import { getCurrentWeather, getLocation, tools } from "./tools";
import { renderNewMessage } from "./dom"


const hf = new InferenceClient(import.meta.env.VITE_HF_TOKEN)

const availableFunctions = {
    getCurrentWeather,
    getLocation
}

async function agent(query) {
    const messages = [
        {
            role: 'system',
            content: `You are a helpful AI agent. Transform technical data into engaging, 
                conversational responses, but only include the normal information a 
                regular person might want unless they explicitly ask for more. Provide 
                highly specific answers based on the information you're given. Prefer 
                to gather information with the tools provided to you rather than 
                giving basic, generic answers.`
        },
        {
            role: 'user',
            content: query
        }
    ]

    const MAX_ITERATIONS = 5

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        console.log(`Iteration #${i+1}`)
        const response = await hf.chatCompletion({
            model: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
            messages,
            tools
        })

        const { finish_reason: finishReason, message } = response.choices[0]
        const { tool_calls: toolCalls } = message
        console.log(toolCalls)

        messages.push(message)

        if (finishReason === 'stop'){
            console.log(message.content)
            console.log('AGENT ENDING')
            return
        }
        else if (finishReason === 'tool_calls') {
            for (const toolCall of toolCalls) {
                const functionName = toolCall.function.name
                const functionToCall = availableFunctions[functionName]
                let functionArgs
                if (toolCall.function.arguments) {
                    functionArgs = JSON.parse(toolCall.function.arguments)
                }
                const functionResponse = await functionToCall(functionArgs)
                console.log(functionResponse)

                messages.push({
                    tool_call_id: toolCall.id,
                    role: 'tool',
                    name: functionName,
                    content: functionResponse
                })
            }
        }
    }
}

console.log(await agent('Jaka jest pogoda w mojej lokalizacji?'))


/**
 * Goal - build an agent that can answer any questions that might require knowledge 
 * about my current location and the current weather at my location.
 */
