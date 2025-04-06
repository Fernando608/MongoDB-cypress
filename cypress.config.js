const { defineConfig } = require('cypress');
const { MongoClient } = require('mongodb');
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Añadimos comandos personalizados para trabajar con MongoDB
      on('task', {
        // Comando para consultar documentos
        async findDocuments({ collection, query = {}, options = {} }) {
          const client = new MongoClient(process.env.MONGO_PUBLIC_URL);
          try {
            await client.connect();
            const database = client.db();
            const result = await database.collection(collection).find(query, options).toArray();
            return result;
          } catch (error) {
            return { error: error.message };
          } finally {
            await client.close();
          }
        },
        
        // Comando para insertar un documento
        async insertDocument({ collection, document }) {
          const client = new MongoClient(process.env.MONGO_PUBLIC_URL);
          try {
            await client.connect();
            const database = client.db();
            const result = await database.collection(collection).insertOne(document);
            return result;
          } catch (error) {
            return { error: error.message };
          } finally {
            await client.close();
          }
        },
        
        // Comando para actualizar documentos
        async updateDocuments({ collection, filter, update }) {
          const client = new MongoClient(process.env.MONGO_PUBLIC_URL);
          try {
            await client.connect();
            const database = client.db();
            const result = await database.collection(collection).updateMany(filter, update);
            return result;
          } catch (error) {
            return { error: error.message };
          } finally {
            await client.close();
          }
        },
        
        // Comando para eliminar documentos
        async deleteDocuments({ collection, filter }) {
          const client = new MongoClient(process.env.MONGO_PUBLIC_URL);
          try {
            await client.connect();
            const database = client.db();
            const result = await database.collection(collection).deleteMany(filter);
            return result;
          } catch (error) {
            return { error: error.message };
          } finally {
            await client.close();
          }
        },
        
        // Comando para limpiar una colección
        async clearCollection(collection) {
          const client = new MongoClient(process.env.MONGO_PUBLIC_URL);
          try {
            await client.connect();
            const database = client.db();
            const result = await database.collection(collection).deleteMany({});
            return result;
          } catch (error) {
            return { error: error.message };
          } finally {
            await client.close();
          }
        }
      });
      
      return config;
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}'
  }
});