import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Stride API',
      version: '1.0.0',
      description: 'Smart errand routing and personal place saving API - Save places, manage errands, and let your map work for you',
      contact: {
        name: 'Stride Support',
        email: 'support@stride.app',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server',
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
      schemas: {
        User: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              example: '6921e345bd11e0565579e349',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Place: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '6921e345bd11e0565579e349',
            },
            name: {
              type: 'string',
              example: 'Blue Bottle Coffee',
            },
            address: {
              type: 'string',
              example: '450 W 15th St, New York, NY',
            },
            latitude: {
              type: 'number',
              example: 40.7425,
            },
            longitude: {
              type: 'number',
              example: -74.0061,
            },
            category: {
              type: 'string',
              example: 'coffee',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['best cortado', 'wifi'],
            },
            notes: {
              type: 'string',
              example: 'Ask for Mike',
            },
            personalRating: {
              type: 'number',
              minimum: 1,
              maximum: 5,
              example: 5,
            },
            collectionId: {
              type: 'string',
              nullable: true,
            },
            visitCount: {
              type: 'number',
              example: 8,
            },
            lastVisited: {
              type: 'string',
              format: 'date-time',
            },
            source: {
              type: 'string',
              enum: ['manual', 'auto-suggested', 'from-errand'],
              example: 'manual',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Errand: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '6921e345bd11e0565579e349',
            },
            title: {
              type: 'string',
              example: 'Pick up prescription',
            },
            category: {
              type: 'string',
              example: 'pharmacy',
            },
            linkedPlaceId: {
              type: 'string',
              nullable: true,
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              example: 'high',
            },
            deadline: {
              type: 'string',
              format: 'date-time',
            },
            recurring: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
                intervalDays: { type: 'number' },
                nextDue: { type: 'string', format: 'date-time' },
              },
            },
            status: {
              type: 'string',
              enum: ['pending', 'done'],
              example: 'pending',
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            completedAtPlaceId: {
              type: 'string',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Collection: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '6921e345bd11e0565579e349',
            },
            name: {
              type: 'string',
              example: 'My Pharmacies',
            },
            icon: {
              type: 'string',
              example: '💊',
            },
            shared: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        UserPreferences: {
          type: 'object',
          properties: {
            errandNotifications: {
              type: 'boolean',
              example: true,
            },
            visitDetection: {
              type: 'boolean',
              example: true,
            },
            geofenceAlerts: {
              type: 'boolean',
              example: true,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: [
    './src/routes/auth.ts',
    './src/routes/places.ts',
    './src/routes/errands.ts',
    './src/routes/collections.ts',
    './src/index.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
