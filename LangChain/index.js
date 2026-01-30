import { openrouter, supabase } from "./config";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const document = await fetch('./movies.txt').then(res => res.text())

async function splitDocument(document) {
    const response = await fetch(`./${document}`)
    const text = await response.text()

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 150,
        chunkOverlap: 15,
    })

    const output = await splitter.createDocuments([text])

    return output
}


async function createAndStoreEmbeddings() {
    const chunkData = await splitDocument('movies.txt')
    console.log(chunkData)
}


createAndStoreEmbeddings()