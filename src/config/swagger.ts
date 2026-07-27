import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Manager API',
      version: '1.0.0',
      description: 'API REST pour la gestion des utilisateurs, l’authentification et la réinitialisation de mot de passe.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
  './src/routes/**/*.ts',
  './src/controllers/**/*.ts'
],
};

export const swaggerSpec = swaggerJSDoc(options);
