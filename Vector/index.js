import { supabase, openrouter, hf } from "./config"
import podcasts from './content.js'


const query = "An episode Elon Musk would enjoy"

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
        const embeddingResponse = await getEmbeddings(
            textChunk,
            "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
        )

        return  { 
          content: textChunk, 
          embedding: embeddingResponse.embeddings 
        }
 
    })    
  );

//   await supabase.from('documents').insert(data); 
  console.log('Embedding complete and inserted!');
}

// insertEmbeddings(podcasts)

async function matchEmbeddings(embedding) {

  const { data } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.29,
    match_count: 1
  })
  
  return data.length ? data[0].content : 'no info'
}

main(query)

const chatMessages = [{
  role: 'system',
  content: `You are an enthusiastic podcast expert who loves recommending podcasts to people.
   You will be given two pieces of information - some context about podcasts episodes and 
   a question. Your main job is to formulate a short answer to the question using the 
   provided context. If you are unsure and cannot find the answer in the context, say, 
   "Sorry, I don't know the answer." Please do not make up the answer.` 
}]

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
