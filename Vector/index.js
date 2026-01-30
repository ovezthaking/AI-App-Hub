import { supabase } from "./config"
import podcasts from './content.js'


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



async function main(input) {
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
  console.log('Embedding complete!');
}

// main(podcasts)

const query = "What can I listen to in half an hour?"

async function matchEmbeddings(input) {
  const result = await getEmbeddings(
    input,
    "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
  );

  const embedding = result.embeddings

  const { data } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.29,
    match_count: 1
  })

  console.log(data)
}

matchEmbeddings(query)