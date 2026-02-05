import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        functionsAgent: resolve(__dirname, 'FunctionsAgent/index.html'),
        langchain: resolve(__dirname, 'LangChain/index.html'),
        pollyglot: resolve(__dirname, 'PollyGlot/index.html'),
        popchoice: resolve(__dirname, 'PopChoice/index.html'),
        popchoiceGoAgain: resolve(__dirname, 'PopChoice/goagain.html'),
        reactAgent: resolve(__dirname, 'ReActAgent/index.html'),
        reelrecs: resolve(__dirname, 'ReelRecs/index.html'),
        stockPredictions: resolve(__dirname, 'stock-predictions/index.html'),
        travelAgent: resolve(__dirname, 'TravelAgent/index.html'),
        travelAgentIntro: resolve(__dirname, 'TravelAgent/intro.html'),
        vector: resolve(__dirname, 'Vector/index.html'),
      }
    }
  }
})
