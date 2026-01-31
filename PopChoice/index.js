import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { hf, supabase, TMDBApiKey } from "./config";
import content from "./content";


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


const splitDocument = async (document) => {
    try {
        const res = await fetch(document)

        if (!res.ok) {
            throw new Error('Response status is not ok')
        }
    
        const text = await res.text()
    
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 300,
            chunkOverlap: 60,
        })

        const output = await splitter.createDocuments([text])

        return output
    } catch (err) {
        console.error('Error: ', err)
    }
}


const storeDocumentEmbeddings = async (document) => {
    try {
        const chunkData = await splitDocument(document)

        const data = await Promise.all(
            chunkData.map( async (chunk) => {
    
                const embeddingResponse = await createEmbedding(chunk.pageContent)
    
                return {
                    content: chunk.pageContent,
                    embedding: embeddingResponse
                }
            })
        )

        if (!data) {
            throw new Error('No data in array')
        }
        
        console.log(data)
        const { error } = await supabase.from('popchoice').insert(data)

        if (error) {
            throw new Error('Issue inserting data into the database.')
        }

        console.log('Embeddings inserted!')
    } catch (err) {
        console.error('Error: ', err)
    }
}

// storeDocumentEmbeddings('movies.txt')

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
        const { error } = await supabase.from('popchoice').insert(data)

        if (error) {
            throw new Error('Issue inserting data into the database.')
        }

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
            match_threshold: 0.35,
            match_count: 1
        })
        
        if (!data) {
            throw new Error('No data matched')
        }

        const match = data.map(obj => obj.content).join('\n')
        // console.log(data)
        return match
    } catch (err) {
        console.error('Error: ', err)
        return 'No data'
    }
}


const getPoster = async (title) => {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${TMDBApiKey}`
        }
    }

    try {
        const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?query=${title}&include_adult=false&language=en-US&page=1`, options)
        
        if (!searchRes.ok) {
            throw new Error('TMDB search response not OK')
        }

        const searchData = await searchRes.json()

        const movie = searchData.results[0] 

        if (!movie) {
            throw new Error('Movie not found')
        }
        
        const posterPath = movie.poster_path
        const posterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`
        
        return posterUrl
    } catch (err) {
        console.error('Error: ', err)
    }
}


const chatMessages = [{
    role: 'system',
    content: `You are a movie recommendation expert. Your task is to:
        1. Read the USER PREFERENCES section
        2. Read the MOVIE DATA FROM DATABASE section  
        3. Compare them and recommend the movie if it matches
        4. If the movie matches the preferences, respond with:
        <h2>Title (year)</h2>
        <p>Why this movie matches their preferences</p>
        5. Always recommend the movie from the database - it was selected because it matches the user's query.
        6. Be enthusiastic and explain the connection.
        7. Respond in language that is provided by user's answers
        `
}]

const getChatCompletion = async (text, query) => {
    chatMessages.length = 1
    
    const main = document.querySelector('main')
    const userContent = `USER PREFERENCES:\n${query}\n\nMOVIE DATA FROM DATABASE:\n${text}`
    
    chatMessages.push({
        role: 'user',
        content: userContent
    })

    try {
        const response = await hf.chatCompletion({
            model: "Qwen/Qwen3-235B-A22B-Instruct-2507",
            messages: chatMessages,
            frequency_penalty: 0.2,
            temperature: 0.65
        })
    
        // console.log(response.choices[0].message.content)
        main.innerHTML = `
            <form method="get" action="index.html">
                    <div class="question">
                        ${text ? response.choices[0].message.content : '<p>' + response.choices[0].message.content + '</p>'}
                    </div>
    
    
            <button type="submit" id="submit-btn">Go Again</button>
        `
        const h2 = main.querySelector('h2')

        if (h2) {
            const title = h2.textContent.split('(')[0].trim()
            const poster = await getPoster(title)
            console.log(title)
            const img = document.createElement('img')
            img.src = poster
            img.alt = 'Movie Poster'
            
            h2.insertAdjacentElement('afterend', img)
        }
        
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
        const text = `Favorite movie: ${answer1.value.trim()}, Current mood: ${answer2.value.trim()}, Have fun or something serious: ${answer3.value}`
        main(text)
    }
})

/*
The Shawshank Redemption Because it taught me to never give up hope no matter how hard life gets

I want to watch movies that were released after 1990

I want to watch something stupid and fun
*/