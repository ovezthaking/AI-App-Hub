import { hf, supabase } from "./config";
import content from "./content";


const question1 = document.getElementById('q1-label')
const question2 = document.getElementById('q2-label')
const question3 = document.getElementById('q3-label')
const answer1 = document.getElementById('question1')
const answer2 = document.getElementById('question2')
const answer3 = document.getElementById('question3')


const createEmbedding = async (input) => {
    const embeddingResponse = await hf.featureExtraction({
        model: 'Qwen/Qwen3-Embedding-8B',
        inputs: input
    })

    return embeddingResponse[0]
}


const storeJsEmbeddings = async (input) => {
    try {
        const data = await Promise.all(
            input.map( async (textChunk) => {
                const text = `${textChunk.title}, ${textChunk.releaseYear}: ${textChunk.content}`
    
                const embeddingResponse = await createEmbedding(text)
    
                return {
                    content: text,
                    embedding: embeddingResponse
                }
            })
        )

        if (!data) {
            throw new Error('No data in array')
        }
        
        console.log(data)
        await supabase.from('popchoice').insert(data)
        console.log('Embeddings inserted!')
    } catch (err) {
        console.error('Error: ', err)
    }
}

// storeJsEmbeddings(content)

const findNearestMatch = async (embedding) => {
    try {
        const { data } = await supabase.rpc('match_popchoice', {
            query_embedding: embedding,
            match_threshold: 0.0,
            match_count: 1
        })
        
        if (!data) {
            throw new Error('No data matched')
        }

        const match = data.map(obj => obj.content).join('\n')
        console.log('Match', match)
        return match
    } catch (err) {
        console.error('Error: ', err)
        return 'No data'
    }
}


const chatMessages = [{
    role: 'system',
    content: `You are an enthusiastic movie expert who loves recommending movies to people.
        You will be given two pieces of information - some context about movies and a answers to questions.
        Your main job is to formulate a short answer to the question using the provided context.
        If you are unsure and cannot find the answer in the context, say,
        "<h2>Sorry, I don't know the answer." Please do not make up the answer.</h2>
        Your answers must be like this example:
        <h2>Title (release year)</h2>
        <p>Informations</p>`
}]

const getChatCompletion = async (text, query) => {
    chatMessages.push({
        role: 'user',
        content: `Context: ${query}, Answers: ${text}`
    })

    try {
        const response = await hf.chatCompletion({
            model: "Qwen/Qwen3-235B-A22B-Instruct-2507",
            messages: chatMessages,
            frequency_penalty: 0.65,
            temperature: 0.5
        })
    
        document.querySelector('main').innerHTML = `
            <form method="get" action="index.html">
                    <div class="question">
                        ${response.choices[0].message.content}
                    </div>
    
    
            <button type="submit" id="submit-btn">Go Again</button>
        `
    } catch (err) {
        console.error('Error: ', err)
    }
}



async function main(input) {
    const button = document.querySelector('button')
    button.outerHTML = '<p class="thinking">Thinking...</p>'
    try {
        const embedding = await createEmbedding(input)
        const match = await findNearestMatch(embedding)
        await getChatCompletion(match, input)
    } catch (err) {
        console.error('Error in main function.', err.message)
        button.outerHTML = '<p class="thinking">Sorry, something went wrong. Please try again.</p>'
    }
}


document.getElementById('questions-form').addEventListener('submit', (e) => {
    e.preventDefault()
    if (answer1.value && answer2.value && answer3.value) {
        const text = `
            My favorite movie is ${answer1.value}, I am in the mood for ${answer2.value}
            and I want ${answer3.value}
        `
        main(text)
    }
})

/*
The Shawshank Redemption Because it taught me to never give up hope no matter how hard life gets

I want to watch movies that were released after 1990

I want to watch something stupid and fun
*/