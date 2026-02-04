import { InferenceClient } from "@huggingface/inference"


export const messages = [
    {
        role: 'system',
        content: `
You are a helpful AI agent. Transform technical data into engaging, 
conversational responses, but only include the normal information a 
regular person might want unless they explicitly ask for more. Provide 
highly specific answers based on the information you're given. Prefer 
to gather information with the tools provided to you rather than 
giving basic, generic answers. Don't give answers in tags. Just text.
`
    },
]


export const agent = async (query) => {
    messages.push({
        role: 'user',
        content: query
    })

    const MAX_ITERATIONS = 8

    
}
