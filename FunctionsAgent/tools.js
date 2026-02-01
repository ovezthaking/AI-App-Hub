export const getCurrentWeather = async ({location}) => {
    const weather = {
        location,
        temperature: '72',
        forecast: 'sunny'
    }
    return JSON.stringify(weather)
}

export const getLocation = async () => {
    try {
        const res = await fetch('https://ipapi.co/json/')
        const text = await res.json()

        return JSON.stringify(text)
    } catch (err) {
        console.log(err)
    }
}

export const tools = [
    {
        type: "function",
        function: {
            name: "getCurrentWeather",
            description: 'Get the current weather',
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "The location from where to get the weather"
                    },
                },
                required: ["location"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getLocation",
            description: "Get the user's current location",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
]
