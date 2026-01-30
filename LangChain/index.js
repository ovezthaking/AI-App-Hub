import { openrouter, supabase } from "./config";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const document = await fetch('./movies.txt').then(res => res.text())

async function splitDocument(document) {
    const response = await fetch(`./${document}`)
    const text = await response.text()

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 250,
        chunkOverlap: 35,
    })

    const output = await splitter.createDocuments([text])

    return output
}


async function createAndStoreEmbeddings() {
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

    // await supabase.from('movies').insert(data)
    console.log('success')
}


async function getEmbeddings(text, model='sentence-transformers/paraphrase-multilingual-mpnet-base-v2') {
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


createAndStoreEmbeddings()