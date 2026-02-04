import { OPENWEATHER_API_KEY, AMADEUS_API_KEY, AMADEUS_SECRET } from "./config"

export async function getWeather(city) {
    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
    )

    const data = await res.json()

    console.log(data)
}


