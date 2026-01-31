import { hf, supabase } from "./config";
import content from "./content";

const createEmbedding = async (input) => {
    const embeddingResponse = await hf.featureExtraction({
        model: 'Qwen/Qwen3-Embedding-8B',
        inputs: input
    })

    return embeddingResponse
}

const storeJsEmbeddings = async (input) => {
    try {
        const data = await Promise.all(
            input.map( async (textChunk) => {
                const text = `${textChunk.title}, ${textChunk.releaseYear}: ${textChunk.content}`
    
                const embeddingResponse = createEmbedding(text)
    
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
