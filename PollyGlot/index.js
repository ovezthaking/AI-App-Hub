import { OpenRouter } from "@openrouter/sdk";
const form = document.querySelector('form')
let selectedLanguage = ''

const fetchTranslation = async (text, choice) => {
    const openrouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY

    const messages = [
        {
            role: 'system',
            content: 'You are a helpful translator. You translate only from english to french, spanish, japanese. You only translate and nothing more'
        },
        {
            role: 'user',
            content: `${text} to ${choice}
            ###
            ¿Qué pasa?
            ###
            ###
            Quoi de neuf?
            ###
            ###
            Dō shita no?
            ###
            `
        }
    ]

    try {
        const openrouter = new OpenRouter({
            apiKey: openrouterApiKey
        })

        const response = await openrouter.chat.send({
            model: "tngtech/deepseek-r1t2-chimera:free",
            messages: messages,
            temperature: 1.1,
            stream: false
        })

        return response.choices[0].message.content
    } catch (err) {
        console.error('Error: ', e)
        return 'Unable to access AI. Please refresh and try again'
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const textToTranslate = document.getElementById('translate-text')
    const translatedText = document.getElementById('translated-text')
    const textToChange = document.querySelector('.changing-text')
    selectedLanguage = document.querySelector('input[name="language"]:checked').value
    
    if (textToTranslate.value) {
        const radios = document.querySelectorAll('.lang-radios')
        radios.forEach(radio => radio.style.display = 'none')
        translatedText.style.display = 'block'
        translatedText.style.color = 'gray'
        translatedText.value = 'translating...'
        textToChange.textContent = '...'

        const result = await fetchTranslation(
            textToTranslate.value,
            selectedLanguage
        )

        textToChange.textContent = 'Your translation 👇'
        translatedText.style.color = 'black'
        translatedText.value = result.trim()
    }
})
