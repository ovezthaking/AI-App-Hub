import { agent } from "./agent"


const travellersInput = document.getElementById('travellers')
const submitBtn = document.querySelector('.main-btn')


export const renderThinking = (content) => {
    document.getElementById('thinking-text')
        .innerHTML = content
    
    document.querySelector('main').classList.add('blur')
    document.querySelector('.thinking').style.display = 'flex'
}


export const renderPostPage = (content) => {
    const main = document.querySelector('main')

    main.classList.remove('blur')
    main.classList.add('post-page')
    document.querySelector('.thinking').style.display = 'none'

    main.innerHTML = content
    
}


document.addEventListener('click', (e) => {
    if (e.target.id === 'plus-btn') {
        travellersInput.value = parseInt(travellersInput.value) + 1
    }

    if (e.target.id === 'minus-btn' && travellersInput.value > 1) {
        travellersInput.value = parseInt(travellersInput.value) - 1
    }
})


document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const toDateInput = document.getElementById('to-date')
    const fromDateInput = document.getElementById('from-date')

    const data = {
        travellers: travellersInput.value,
        from: document.getElementById('from').value,
        to: document.getElementById('to').value,
        fromDate: fromDateInput.value,
        toDate: toDateInput.value,
        budget: document.getElementById('budget').value
    }

    if (data.toDate && data.toDate < data.fromDate){
        toDateInput.setCustomValidity('Return date can\'t be earlier than departure date')
        toDateInput.reportValidity()
        return
    }
    
    toDateInput.setCustomValidity('')
    
    submitBtn.disabled = true
    renderThinking('Thinking...')
    
    const prompt = `
    I want to travel from ${data.from} to ${data.to}
    on dates: from ${data.fromDate} to ${data.toDate} with ${data.travellers} adults.
    My budget is ${data.budget}.
    Give me WEATHER, FLIGHTS and HOTEL sections in following format:
    <h1>Your Trip</h1>
    <div class="head-container">
        <div class="dates"><p>→ 1st Feb 26</p><p>5th Sep 26 ←</p></div>
        <div class="locations">ORIGIN CITY → DESTINATION CITY</div>
    </div>
    <h2> Weather </h2>
    <div class="weather"><p>WEATHER TEXT</p></div>
    <h2> Flights </h2>
    <div class="flights">
        <p>FLIGHTS TEXT</p>
        <a href=FILL LINK FROM CHEAPEST FLIGHT>Book</a>
    </div>
    <h2> Hotel </h2>
    <div class="hotel">
        <p>HOTEL TEXT</p>
        <a href=FILL LINK FROM CHEAPEST HOTEL>Book</a>
    </div>
    `

    await agent(prompt)
})
