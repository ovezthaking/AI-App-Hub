import { renderThinking } from "."
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
        console.log(`Iteration #${i+1}`)
        console.log(messages)
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
                // here I have to render this in cozy format
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



/*
{
    "id": "dfe94021f1e0eeec5e933131e04a143a",
    "object": "chat.completion",
    "created": 1770242959,
    "model": "xiaomimimo/mimo-v2-flash",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "I'll help you plan your trip from Wrocław to Paris. Let me gather the latest information for you.",
                "tool_calls": [
                    {
                        "index": 0,
                        "id": "call_e2d153c0d98b4762a9161bfa",
                        "type": "function",
                        "function": {
                            "name": "getWeather",
                            "arguments": "{\"city\": \"Paris\"}"
                        }
                    },
                    {
                        "index": 1,
                        "id": "call_fc70b0f2c7104aa485006acc",
                        "type": "function",
                        "function": {
                            "name": "getFlights",
                            "arguments": "{\"originLocationCode\": \"WRO\", \"destinationLocationCode\": \"CDG\", \"departureDate\": \"2026-02-05\", \"returnDate\": \"2026-02-10\", \"travellers\": 2}"
                        }
                    },
                    {
                        "index": 2,
                        "id": "call_ab2c19cae3b840ada27633c8",
                        "type": "function",
                        "function": {
                            "name": "getHotel",
                            "arguments": "{\"cityCode\": \"CDG\"}"
                        }
                    }
                ]
            },
            "finish_reason": "tool_calls"
        }
    ],
    "usage": {
        "prompt_tokens": 726,
        "completion_tokens": 149,
        "total_tokens": 875,
        "prompt_tokens_details": {
            "audio_tokens": 0,
            "cached_tokens": 725,
            "cache_creation_input_tokens": 0,
            "cache_read_input_tokens": 0,
            "text_tokens": 0,
            "image_tokens": 0,
            "video_tokens": 0
        },
        "completion_tokens_details": null
    },
    "system_fingerprint": ""
}
*/