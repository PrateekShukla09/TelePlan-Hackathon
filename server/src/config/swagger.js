const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI-Powered Telecom Tariff Plan Recommendation System API',
      version: '1.0.0',
      description: 'Production-ready Express.js API powering telecom tariff plan scoring and customer profile recommendations.'
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    paths: {
      '/api/health': {
        get: {
          summary: 'Health check endpoint',
          responses: {
            200: { description: 'Server operational' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Admin login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', example: 'admin' },
                    password: { type: 'string', example: 'adminpassword123' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'JWT Token generated' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/customers/{id}': {
        get: {
          summary: 'Get customer by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Customer details' },
            404: { description: 'Customer not found' }
          }
        }
      },
      '/api/customers/{id}/usage': {
        get: {
          summary: 'Get customer usage breakdown by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Customer usage metrics' },
            404: { description: 'Customer not found' }
          }
        }
      },
      '/api/plans': {
        get: {
          summary: 'List available tariff plans',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
            { name: 'roamingIncluded', in: 'query', schema: { type: 'boolean' } }
          ],
          responses: {
            200: { description: 'List of plans' }
          }
        },
        post: {
          summary: 'Create a new tariff plan (Admin Only)',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Plan created' } }
        }
      },
      '/api/plans/{id}': {
        put: {
          summary: 'Update tariff plan (Admin Only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Plan updated' } }
        },
        delete: {
          summary: 'Delete tariff plan (Admin Only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Plan deleted' } }
        }
      },
      '/api/recommendations/by-customer/{id}': {
        post: {
          summary: 'Generate recommendations for an existing customer by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Top 3 recommended tariff plans with match scores' }
          }
        }
      },
      '/api/recommendations/by-profile': {
        post: {
          summary: 'Generate top 3 recommendations based on user profile',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    profile: {
                      type: 'object',
                      properties: {
                        dataNeed: { type: 'string', example: 'high' },
                        callingNeed: { type: 'string', example: 'medium' },
                        smsNeed: { type: 'string', example: 'low' },
                        budget: { type: 'number', example: 700 },
                        roamingRequired: { type: 'boolean', example: true },
                        familyOrIndividual: { type: 'string', example: 'individual' }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Top 3 recommended tariff plans with match scores' }
          }
        }
      }
    }
  },
  apis: []
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};

module.exports = setupSwagger;
