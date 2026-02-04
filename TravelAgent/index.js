import { getFlights, getHotels, getWeather } from "./tools"


const travellersInput = document.getElementById('travellers')

document.addEventListener('click', (e) => {
    if (e.target.id === 'plus-btn') {
        travellersInput.value = parseInt(travellersInput.value) + 1
    }

    if (e.target.id === 'minus-btn' && travellersInput.value > 1) {
        travellersInput.value = parseInt(travellersInput.value) - 1
    }
})


document.querySelector('.main-btn').addEventListener('click', (e) => {
    e.preventDefault()

    const data = {
        travellers: travellersInput.value,
        from: document.getElementById('from'),
        to: document.getElementById('to'),
        fromDate: document.getElementById('from-date'),
        toDate: document.getElementById('to-date'),
        budget: document.getElementById('budget')
    }

    
})

// console.log(await getFlights('WRO', 'CDG', '2026-02-05', '2026-02-10', 2))
// console.log(await getHotels('WRO'))
