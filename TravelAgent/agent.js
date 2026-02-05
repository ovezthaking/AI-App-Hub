import { renderPostPage, renderThinking } from "."
import { hf } from "./config"
import { getFlights, getHotels, getWeather, tools } from "./tools"


const availableFunctions = {
    getWeather,
    getFlights,
    getHotels
}


export const messages = [
    {
        role: 'system',
        content: `
You are a helpful travel AI agent. Transform technical data into engaging, 
conversational responses, but only include the normal information a 
regular person might want unless they explicitly ask for more. Provide 
highly specific answers based on the information you're given. Prefer 
to gather information with the tools provided to you rather than 
giving basic, generic answers. Use tools when needed. Don't give answers in tags. Just text.
Give answer in user's cities inputs language.
`
    },
]


export const agent = async (query) => {
    messages.push({
        role: 'user',
        content: query
    })
    


    const MAX_ITERATIONS = 8

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        try {
            const res = await hf.chatCompletion({
                model: 'XiaomiMiMo/MiMo-V2-Flash',
                messages,
                tools
            })
    
            const { finish_reason: finishReason, message } = res.choices[0]
            const { tool_calls: toolCalls, content: messageContent } = message
    
            messages.push(message)
            
            if (finishReason === 'stop') {
                renderPostPage(messageContent)
                console.log('on stop: ', messageContent)
                return
            }
            else if (finishReason === 'tool_calls') {
                renderThinking(messageContent)
    
                for (const toolCall of toolCalls) {
                    const functionName = toolCall.function.name
                    const functionToCall = availableFunctions[functionName]
                    
                    if (!functionToCall) {
                        console.error(`Function ${functionName} not found in availableFunctions`)
                        continue
                    }
                    
                    let functionArgs
                    if (toolCall.function.arguments) {
                        functionArgs = JSON.parse(toolCall.function.arguments)
                    }
                    const functionResponse = await functionToCall(functionArgs)
                    
                    messages.push({
                        tool_call_id: toolCall.id,
                        role: 'tool',
                        name: functionName,
                        content: functionResponse
                    })
                }
            }
        } catch (err) {
            console.error('ERROR: ', err)
            throw new Error(err)
        }
    }
}
