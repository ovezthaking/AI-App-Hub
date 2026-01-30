import { supabase, hf } from "./config";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";


const query = "I feel like having a good laugh!"
main(query)


async function main(input) {
    const result = await getEmbeddings(
        input,
        "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
    )

    const embedding = await result.embeddings
    const match = await findNearestMatch(embedding)
    await getChatCompletion(match, input)
}

async function splitDocument(document) {
    try {
        const response = await fetch(`./${document}`)

        if (!response.ok){
            throw new Error('Network response was not ok.')
        }

        const text = await response.text()
    
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 250,
            chunkOverlap: 35,
        })
    
        const output = await splitter.createDocuments([text])
    
        return output
    } catch (e) {
        console.error('There was an issue with splitting text ')
        throw e
    }
}


async function createAndStoreEmbeddings() {
    try {
        const chunkData = await splitDocument('movies.txt')
        
        const data = await Promise.all(
            chunkData.map(async (chunk) => {
                const embedding = await getEmbeddings(chunk.pageContent)
                
                return {
                    content: chunk.pageContent,
                    embedding: embedding.embeddings
                }
            })
        )
    
        // const { error } = await supabase.from('movies').insert(data)
        // if (error) {
        //     throw new Error('Issue inserting data into the database.');
        // }

        console.log('success')
    } catch (e) {
        console.error('Error: ', e.message)
    }
}


async function getEmbeddings(text, model='sentence-transformers/paraphrase-multilingual-mpnet-base-v2') {
  const embeddingResponse = await hf.featureExtraction({
    model: model,
    inputs: text
  });
  
  return { embeddings: embeddingResponse };
}


async function findNearestMatch(embedding) {
    const { data } = await supabase.rpc('match_movies', {
        query_embedding: embedding,
        match_threshold: 0.20,
        match_count: 4
    })

    const match = data.map(obj => obj.content).join('\n')
    console.log('Match: \n' + match + '\n')
    return data.length ? match : 'no info'
}

const chatMessages = [{
    role: 'system',
    content: `You are an enthusiastic movie expert who loves recommending movies to people.
    You will be given two pieces of information - some context about movies and a question.
    Your main job is to formulate a short answer to the question using the provided context.
    If you are unsure and cannot find the answer in the context, say,
    "Sorry, I don't know the answer." Please do not make up the answer.` 
}];

async function getChatCompletion(text, query) {
    chatMessages.push({
        role: 'user',
        content: `Context: ${text} Question: ${query}`
    })

    const response = await hf.chatCompletion({
        model: "zai-org/GLM-4.7-Flash",
        messages: chatMessages,
        frequency_penalty: 0.5,
        temperature: 0.5
    })

    console.log(response.choices[0].message.content)
    document.querySelector('body').innerHTML = `<p>${response.choices[0].message.content}</p>`
}
