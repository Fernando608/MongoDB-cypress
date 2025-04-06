describe('MongoDB Tests', () => {
    const testCollection = 'test_users';
    
    beforeEach(() => {
      // Limpiamos la colección de pruebas antes de cada test
      cy.clearMongoCollection(testCollection);
      cy.clearMongoCollection('test_products');
    });
    
    it('Debería insertar un documento en MongoDB', () => {
      const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        age: 30,
        active: true,
        createdAt: new Date()
      };
      
      cy.insertInMongo(testCollection, testUser)
        .then((result) => {
          expect(result.acknowledged).to.be.true;
          expect(result.insertedId).to.not.be.null;
        });
        
      // Verificamos que el documento fue insertado correctamente
      cy.findInMongo(testCollection, { email: 'test@example.com' })
        .then((docs) => {
          expect(docs).to.have.length(1);
          expect(docs[0].name).to.equal('Test User');
          expect(docs[0].age).to.equal(30);
          expect(docs[0].active).to.be.true;
        });
    });
    
    it('Debería actualizar un documento en MongoDB', () => {
      // Primero insertamos un documento para actualizarlo después
      const testUser = {
        name: 'Update Test',
        email: 'update@example.com',
        age: 25
      };
      
      cy.insertInMongo(testCollection, testUser)
        .then(() => {
          // Actualizamos el documento
          cy.updateInMongo(
            testCollection,
            { email: 'update@example.com' },
            { $set: { age: 26, updated: true } }
          ).then((updateResult) => {
            expect(updateResult.acknowledged).to.be.true;
            expect(updateResult.modifiedCount).to.equal(1);
          });
          
          // Verificamos que la actualización se aplicó correctamente
          cy.findInMongo(testCollection, { email: 'update@example.com' })
            .then((docs) => {
              expect(docs[0].age).to.equal(26);
              expect(docs[0].updated).to.be.true;
            });
        });
    });
    
    it('Debería eliminar un documento en MongoDB', () => {
      // Insertamos algunos documentos
      const users = [
        { name: 'User 1', email: 'user1@example.com' },
        { name: 'User 2', email: 'user2@example.com' },
        { name: 'User 3', email: 'user3@example.com' }
      ];
      
      // Insertamos los usuarios uno por uno
      cy.insertInMongo(testCollection, users[0]);
      cy.insertInMongo(testCollection, users[1]);
      cy.insertInMongo(testCollection, users[2]);
      
      // Verificamos que se insertaron correctamente
      cy.findInMongo(testCollection)
        .then((docs) => {
          expect(docs).to.have.length(3);
        });
        
      // Eliminamos un documento
      cy.deleteFromMongo(testCollection, { email: 'user2@example.com' })
        .then((deleteResult) => {
          expect(deleteResult.acknowledged).to.be.true;
          expect(deleteResult.deletedCount).to.equal(1);
        });
        
      // Verificamos que solo quedan dos documentos
      cy.findInMongo(testCollection)
        .then((docs) => {
          expect(docs).to.have.length(2);
          const emails = docs.map(d => d.email);
          expect(emails).to.include('user1@example.com');
          expect(emails).to.include('user3@example.com');
          expect(emails).to.not.include('user2@example.com');
        });
    });
    
    it('Debería realizar consultas complejas con operadores', () => {
      // Insertamos usuarios con diferentes edades
      const users = [
        { name: 'Young User', email: 'young@example.com', age: 18 },
        { name: 'Adult User', email: 'adult@example.com', age: 35 },
        { name: 'Senior User', email: 'senior@example.com', age: 65 }
      ];
      
      // Insertamos los usuarios
      users.forEach(user => {
        cy.insertInMongo(testCollection, user);
      });
      
      // Realizamos una consulta con operador $gt (mayor que)
      cy.findInMongo(testCollection, { age: { $gt: 30 } })
        .then((docs) => {
          expect(docs).to.have.length(2);
          const names = docs.map(d => d.name);
          expect(names).to.include('Adult User');
          expect(names).to.include('Senior User');
        });
        
      // Realizamos una consulta con operador $lt (menor que)
      cy.findInMongo(testCollection, { age: { $lt: 20 } })
        .then((docs) => {
          expect(docs).to.have.length(1);
          expect(docs[0].name).to.equal('Young User');
        });
        
      // Realizamos una consulta con operadores combinados
      cy.findInMongo(testCollection, { age: { $gte: 18, $lte: 50 } })
        .then((docs) => {
          expect(docs).to.have.length(2);
          const names = docs.map(d => d.name);
          expect(names).to.include('Young User');
          expect(names).to.include('Adult User');
        });
    });
    
    it('Debería trabajar con documentos anidados', () => {
      // Documento con estructura anidada
      const product = {
        name: 'Phone',
        price: 1200,
        specs: {
          cpu: 'Intel i7',
          ram: '16GB',
          storage: {
            type: 'SSD',
            capacity: '512GB'
          }
        },
        categories: ['electronics', 'computers']
      };
      
      cy.insertInMongo('test_products', product)
        .then(() => {
          // Consulta en documento anidado
          cy.findInMongo('test_products', { 'specs.cpu': 'Intel i7' })
            .then((docs) => {
              expect(docs).to.have.length(1);
              expect(docs[0].name).to.equal('Phone');
            });
            
          // Consulta en documento doblemente anidado
          cy.findInMongo('test_products', { 'specs.storage.type': 'SSD' })
            .then((docs) => {
              expect(docs).to.have.length(1);
              expect(docs[0].specs.storage.capacity).to.equal('512GB');
            });
            
          // Consulta en array
          cy.findInMongo('test_products', { categories: 'computers' })
            .then((docs) => {
              expect(docs).to.have.length(1);
              expect(docs[0].categories).to.include('electronics');
            });
        });
    });
});