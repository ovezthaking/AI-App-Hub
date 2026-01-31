import { hf, supabase } from "./config";
import content from "./content";


const createEmbedding = async (input) => {
    const embeddingResponse = await hf.featureExtraction({
        model: 'Qwen/Qwen3-Embedding-8B',
        inputs: input
    })

    console.log(embeddingResponse[0])
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
    const { data } = await supabase.rpc('match_popchoice', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 1
    })

    const match = data.map(obj => obj.content).join('\n')
    return match;
}


const chatMessages = [{
    role: 'system',
    content: `You are an enthusiastic movie expert who loves recommending movies to people.
        You will be given two pieces of information - some context about movies and a question.
        Your main job is to formulate a short answer to the question using the provided context.
        If you are unsure and cannot find the answer in the context, say,
        "<h2>Sorry, I don't know the answer." Please do not make up the answer.</h2>
        Your answers must be like this example:
        <h2>Title (release year)</h2>
        <p>Informations</p>`
}]


