export const getCurrentWeather = async () => {
    const weather = {
        temperature: '72',
        unit: 'F',
        forecast: 'sunny'
    }
    return JSON.stringify(weather)
}

export const getLocation = async () => {
    return "Salt Lake City, UT"
}