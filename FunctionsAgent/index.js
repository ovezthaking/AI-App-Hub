import { InferenceClient } from "@huggingface/inference";
import { getCurrentWeather, getLocation, tools } from "./tools";
import { renderNewMessage } from "./dom"


const hf = new InferenceClient(import.meta.env.VITE_HF_TOKEN)

const availableFunctions = {
    getCurrentWeather,
    getLocation
}

const messages = [
    {
        role: 'system',
        content: `
You are a helpful AI agent. Transform technical data into engaging, 
conversational responses, but only include the normal information a 
regular person might want unless they explicitly ask for more. Provide 
highly specific answers based on the information you're given. Prefer 
to gather information with the tools provided to you rather than 
giving basic, generic answers.
`
    },
]

async function agent(query) {
    
    messages.push({
        role: 'user',
        content: query
    })
    renderNewMessage(query, 'user')

    const MAX_ITERATIONS = 5

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        // console.log(`Iteration #${i+1}`)
        const response = await hf.chatCompletion({
            model: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
            messages,
            tools
        })

        const { finish_reason: finishReason, message } = response.choices[0]
        const { tool_calls: toolCalls } = message
        // console.log(toolCalls)

        messages.push(message)

        if (finishReason === 'stop'){
            const finalMessage = message.content
            messages.push({ role: 'system', content: finalMessage })
            renderNewMessage(finalMessage, 'assistant')
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
                // console.log(functionResponse)

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


document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const inputEl = document.getElementById('user-input')
    inputEl.focus()
    const formData = new FormData(e.target)
    const query = formData.get('user-input')
    e.target.reset()
    await agent(query)
})


/**
 * Goal - build an agent that can answer any questions that might require knowledge 
 * about my current location and the current weather at my location.
 */
