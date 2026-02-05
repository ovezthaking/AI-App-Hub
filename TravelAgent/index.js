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
    <div class="weather">WEATHER TEXT</div>
    <h2> Flights </h2>
    <div class="flights">FLIGHTS TEXT</div>
    <h2> Hotel </h2>
    <div class="hotel">HOTEL TEXT</div>
    `

    await agent(prompt)
})

// console.log(await getFlights('WRO', 'CDG', '2026-02-05', '2026-02-10', 2))
// console.log(await getHotels('WRO'))
// const prompt = `
//     I want to travel from Wrocław to Paris
//   on dates: from 2026-02-05 to 2026-02-10 with 2 adults.
//   My budget is 5000.
//   Give me WEATHER, FLIGHTS and HOTEL sections.
// `
// await agent(prompt)

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
