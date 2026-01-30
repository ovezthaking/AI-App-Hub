import { openrouter, supabase } from "./config";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const document = await fetch('./movies.txt').then(res => res.text())

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