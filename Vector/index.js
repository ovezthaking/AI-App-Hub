import { supabase, openrouter } from "./config"
import podcasts from './content.js'


const query = "An episode Elon Musk would enjoy"

async function main(input) {
  const result = await getEmbeddings(
    input,
    "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
  )
  const embedding = await result.embeddings
  const match = await matchEmbeddings(embedding)
  await getChatCompletion(match, input)
}

async function getEmbeddings(text, model) {
  const response = await fetch('http://localhost:3000/api/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, model }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
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

  const response = await openrouter.chat.send({
      model: "tngtech/deepseek-r1t2-chimera:free",
      messages: chatMessages,
      frequencyPenalty: 0.5,
      temperature: 0.5
  })

  console.log(response.choices[0].message.content)
  document.querySelector('body').innerHTML = `<p>${response.choices[0].message.content}</p>`
}
