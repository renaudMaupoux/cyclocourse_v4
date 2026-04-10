/**
 * Spécification OpenAPI 3 pour Swagger UI (`/api-docs`).
 */
export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'CycloCourse API',
    version: '1.0.0',
    description:
      'API REST pour la reconnaissance de dossards (1–1000), gestion des coureurs et passages. ' +
      'Les mises à jour temps réel des `numbers` passent aussi par Socket.IO (événements non documentés ici).'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Développement local'
    }
  ],
  tags: [
    { name: 'Meta', description: 'Informations API' },
    { name: 'Numbers', description: 'Passages / chiffres détectés persistés' },
    { name: 'Riders', description: 'Coureurs (inscription, import CSV, classement)' },
    { name: 'Voice', description: 'Extraction de chiffres à partir de texte (voix ou saisie manuelle)' }
  ],
  paths: {
    '/': {
      get: {
        tags: ['Meta'],
        summary: 'Infos API',
        responses: {
          '200': {
            description: 'Métadonnées et liens vers les préfixes de routes',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiInfoResponse' }
              }
            }
          }
        }
      }
    },
    '/api/numbers': {
      get: {
        tags: ['Numbers'],
        summary: 'Lister tous les passages',
        description: 'Tri côté serveur par `timestamp` décroissant.',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NumbersListResponse' }
              }
            }
          }
        }
      }
    },
    '/api/numbers/reset': {
      post: {
        tags: ['Numbers'],
        summary: 'Supprimer tous les passages',
        description: 'Émet aussi `numbers-reset` sur Socket.IO.',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    count: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/numbers/{id}': {
      get: {
        tags: ['Numbers'],
        summary: 'Obtenir un passage par id',
        parameters: [{ $ref: '#/components/parameters/NumberId' }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NumberSingleResponse' }
              }
            }
          },
          '404': { description: 'Non trouvé' }
        }
      },
      put: {
        tags: ['Numbers'],
        summary: 'Modifier la valeur d’un passage',
        parameters: [{ $ref: '#/components/parameters/NumberId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['value'],
                properties: {
                  value: { type: 'integer', minimum: 1, maximum: 1000 }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NumberSingleResponse' }
              }
            }
          },
          '404': { description: 'Non trouvé' }
        }
      },
      delete: {
        tags: ['Numbers'],
        summary: 'Supprimer un passage',
        parameters: [{ $ref: '#/components/parameters/NumberId' }],
        responses: {
          '200': { description: 'OK' },
          '404': { description: 'Non trouvé' }
        }
      }
    },
    '/api/riders': {
      get: {
        tags: ['Riders'],
        summary: 'Lister les coureurs',
        parameters: [
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Filtre nom, club ou n° de dossard'
          }
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RidersListResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Riders'],
        summary: 'Créer un coureur',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RiderCreate' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Créé',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Rider' }
                  }
                }
              }
            }
          },
          '409': { description: 'Dossard déjà utilisé' }
        }
      }
    },
    '/api/riders/ranking': {
      get: {
        tags: ['Riders'],
        summary: 'Classement par premier passage (table `numbers`)',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RiderRankingResponse' }
              }
            }
          }
        }
      }
    },
    '/api/riders/import-csv': {
      post: {
        tags: ['Riders'],
        summary: 'Importer ou mettre à jour des coureurs depuis un CSV',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['csvText'],
                properties: {
                  csvText: { type: 'string', description: 'Contenu brut du fichier CSV' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Import terminé' },
          '400': { description: 'CSV invalide' }
        }
      }
    },
    '/api/riders/{id}': {
      delete: {
        tags: ['Riders'],
        summary: 'Supprimer un coureur',
        parameters: [{ $ref: '#/components/parameters/RiderId' }],
        responses: {
          '200': { description: 'OK' },
          '404': { description: 'Non trouvé' }
        }
      }
    },
    '/api/voice/recognize-text': {
      post: {
        tags: ['Voice'],
        summary: 'Extraire et enregistrer les dossards depuis un texte',
        description:
          'Parse le texte (chiffres et mots français), crée une ligne `numbers` par valeur valide, ' +
          'émet `number-detected` sur Socket.IO.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['text'],
                properties: {
                  text: { type: 'string', minLength: 1, maxLength: 8000 },
                  confidence: {
                    type: 'number',
                    minimum: 0,
                    maximum: 1,
                    description: 'Optionnel, défaut côté serveur si absent'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'OK (liste possiblement vide)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/NumberEntry' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    parameters: {
      NumberId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' }
      },
      RiderId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' }
      }
    },
    schemas: {
      ApiInfoResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          version: { type: 'string' },
          endpoints: { type: 'object', additionalProperties: true }
        }
      },
      NumberEntry: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          value: { type: 'integer', minimum: 1, maximum: 1000 },
          confidence: { type: 'number' },
          originalText: { type: 'string', nullable: true },
          isEdited: { type: 'boolean' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      NumbersListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          count: { type: 'integer' },
          data: { type: 'array', items: { $ref: '#/components/schemas/NumberEntry' } }
        }
      },
      NumberSingleResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { $ref: '#/components/schemas/NumberEntry' }
        }
      },
      Rider: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          numero: { type: 'integer' },
          nom: { type: 'string' },
          club: { type: 'string' },
          category: { type: 'integer', minimum: 1, maximum: 6 }
        }
      },
      RiderCreate: {
        type: 'object',
        required: ['numero', 'nom', 'category'],
        properties: {
          numero: { type: 'integer', minimum: 1, maximum: 1000 },
          nom: { type: 'string' },
          club: { type: 'string' },
          category: { type: 'integer', minimum: 1, maximum: 6 }
        }
      },
      RidersListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array', items: { $ref: '#/components/schemas/Rider' } }
        }
      },
      RiderRankingRow: {
        allOf: [
          { $ref: '#/components/schemas/Rider' },
          {
            type: 'object',
            properties: {
              firstAcquisitionAt: { type: 'string', format: 'date-time', nullable: true },
              rank: { type: 'integer' }
            }
          }
        ]
      },
      RiderRankingResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array', items: { $ref: '#/components/schemas/RiderRankingRow' } }
        }
      }
    }
  }
} as const;
