import { OPENWEATHER_API_KEY, AMADEUS_API_KEY, AMADEUS_SECRET, getAmadeusToken } from "./config"

export async function getWeather(city) {
    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
    )

    const data = await res.json()

    return data
}


export async function getFlights(
    originLocationCode, destinationLocationCode,
    departureDate, returnDate, travellers
) {
    const token = await getAmadeusToken()

    const res = await fetch(
        `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originLocationCode}&destinationLocationCode=${destinationLocationCode}&adults=2&max=5&departureDate=${departureDate}&returnDate=${returnDate}&adults=${travellers}&max=3`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    const data = await res.json()
    
    
    return { offers: data.data, lines: data.dictionaries }
}


export async function getHotels(cityCode) {
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

    return data.data.slice(0,3)
}


