import { supabase, hf } from "./config"
import podcasts from './content.js'


const query = "Something for Elon Musk"

async function main(input) {
  const embedding = await createEmbedding(input)
  const match = await matchEmbeddings(embedding)
  await getChatCompletion(match, input)
}

async function createEmbedding(input) {
  const embeddingResponse = await hf.featureExtraction({
    model: "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
    inputs: input
  });
  
  return embeddingResponse;
}


// const result = await getEmbeddings(
//   "That is a happy person",
//   "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
// );



async function insertEmbeddings(input) {
  const data = await Promise.all(
    input.map( async (textChunk) => {
        const embeddingResponse = await hf.featureExtraction({
          model: "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
          inputs: textChunk
        });

        return  { 
          content: textChunk, 
          embedding: embeddingResponse 
        }
 
    })    
  );

  // await supabase.from('documents').insert(data); 
  console.log('Embedding complete and inserted!');
}

// insertEmbeddings(podcasts)

async function matchEmbeddings(embedding) {
  try {
    const { data } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.25,
      match_count: 1
    })
    
    const result = data.length ? data[0].content : 'no info'

    return result
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

main(query)

const chatMessages = [{
  role: 'system',
  content: `You are an enthusiastic podcast expert who loves recommending podcasts to people.
   You will be given some context about a podcast episode and a question or topic request.
   Your job is to recommend the podcast based on how well it matches the request.
   Be creative in finding connections between the request and the podcast content.
   If the podcast is relevant to the request, recommend it enthusiastically.
   Provide a short, engaging recommendation.` 
}]

async function getChatCompletion(text, query) {
  
  chatMessages.push({
    role: 'user',
    content: `Context: ${text} Question: ${query}`
  })
  
  const response = await hf.chatCompletion({
      model: "zai-org/GLM-4.7-Flash",
      messages: chatMessages,
      frequency_penalty: 0.3,
      temperature: 0.7
  })

  console.log('Chat response:', response.choices[0].message.content)
  document.querySelector('body').innerHTML = `<p>${response.choices[0].message.content}</p>`
}
