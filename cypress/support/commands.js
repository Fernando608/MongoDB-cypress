// Comandos personalizados para interactuar con MongoDB en las pruebas

// Comando para buscar documentos en una colección
Cypress.Commands.add('findInMongo', (collection, query = {}, options = {}) => {
    return cy.task('findDocuments', { collection, query, options });
  });
  
  // Comando para insertar un documento en una colección
  Cypress.Commands.add('insertInMongo', (collection, document) => {
    return cy.task('insertDocument', { collection, document });
  });
  
  // Comando para actualizar documentos en una colección
  Cypress.Commands.add('updateInMongo', (collection, filter, update) => {
    return cy.task('updateDocuments', { collection, filter, update });
  });
  
  // Comando para eliminar documentos de una colección
  Cypress.Commands.add('deleteFromMongo', (collection, filter) => {
    return cy.task('deleteDocuments', { collection, filter });
  });
  
  // Comando para limpiar una colección
  Cypress.Commands.add('clearMongoCollection', (collection) => {
    return cy.task('clearCollection', collection);
});