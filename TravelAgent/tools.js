import { OPENWEATHER_API_KEY, AMADEUS_API_KEY, AMADEUS_SECRET, getAmadeusToken } from "./config"

export async function getWeather({city}) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
        )
    
        const data = await res.json()
    
        return JSON.stringify(data)
    } catch (err) {
        console.error('Error getting weather: ', err)
        throw new Error(err)
    }
}


export async function getFlights({
    originLocationCode, destinationLocationCode,
    departureDate, returnDate=null, travellers
}) {
    try {
        const token = await getAmadeusToken()
    
        let url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originLocationCode}&destinationLocationCode=${destinationLocationCode}&adults=2&max=5&departureDate=${departureDate}&adults=${travellers}&max=3`
    
        if (returnDate) {
            url += `&returnDate=${returnDate}`
        }
    
        const res = await fetch(
            url,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
    
        const data = await res.json()
        
        
        return { offers: JSON.stringify(data.data), lines: JSON.stringify(data.dictionaries) }
    } catch (err) {
        console.error('Error getting Flights: ', err)
        throw new Error(err)
    }
}


export async function getHotels({cityCode}) {
    try {
        const token = await getAmadeusToken()
    
        const res = await fetch(
            `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=5`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            }
        )
    
        const data = await res.json()
    
        return JSON.stringify(data.data.slice(0,3))
    } catch (err) {
        console.error('Error getting hotels: ', err)
        throw new Error(err)
    }
}

export const tools = [
    {
        type: 'function',
        function: {
            name: 'getWeather',
            description: 'Get the current weather of destination city',
            parameters: {
                type: 'object',
                properties: {
                    city: { type: 'string' }
                },
                required: ['city']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'getFlights',
            description: 'Get flights from origin Location to the destination in provided dates',
            parameters: {
                type: 'object',
                properties: {
                    originLocationCode: {
                        type: 'string',
                        description: 'Location code of origin location city'
                    },
                    destinationLocationCode: {
                        type: 'string',
                        description: 'Location code of destination city'
                    },
                    departureDate: {
                        type: 'string',
                        description: 'Departure date in YYYY-MM-DD format'
                    },
                    returnDate: {
                        type: 'string',
                        description: 'Return date in YYYY-MM-DD format'
                    },
                    travellers: {
                        type: 'number',
                        description: 'Number of travellers/adults'
                    }
                },
                required: ['originLocationCode', 'destinationLocationCode', 'departureDate', 'travellers']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'getHotels',
            description: 'Get Hotels in the destination location',
            parameters: {
                type: 'object',
                properties: {
                    cityCode: {
                        type: 'string',
                        description: 'Location code of destination location city'
                    },
                },
                required: ['cityCode']
            }
        }
    }
]
