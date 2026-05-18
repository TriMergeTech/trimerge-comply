const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TriMerge Auth API',
      version: '1.0.0',
      description: 'Secure authentication API for TriMerge Consulting Group.',
    },
    servers: [
      { url: 'https://trimerge-comply.onrender.com', description: 'Production server' },
      { url: 'http://localhost:4000', description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            email: { type: 'string', example: 'ibrahim@trimerge.com' },
            phone: { type: 'string', nullable: true },
            isVerified: { type: 'boolean', example: true },
            role: { type: 'string', enum: ['admin', 'analyst', 'viewer'], example: 'viewer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Audit: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            name: { type: 'string', example: 'Q1 2026 Pay Equity Review' },
            description: { type: 'string', nullable: true, example: 'Initial audit for Q1 payroll data' },
            status: { type: 'string', enum: ['draft', 'processing', 'completed', 'flagged'], example: 'draft' },
            organization: { type: 'string', nullable: true, example: 'TriMerge Consulting' },
            createdBy: { type: 'object', properties: { email: { type: 'string' }, role: { type: 'string' } } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Flag: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            auditId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            group: { type: 'string', example: 'Female' },
            referenceGroup: { type: 'string', example: 'Male' },
            selected: { type: 'number', example: 30 },
            total: { type: 'number', example: 50 },
            selectionRate: { type: 'number', example: 0.6 },
            impactRatio: { type: 'number', example: 0.75 },
            threshold: { type: 'number', example: 0.8 },
            testType: { type: 'string', enum: ['four_fifths', 'fisher_exact', 'chi_square'], example: 'fisher_exact' },
            pValue: { type: 'number', example: 0.032 },
            severity: { type: 'string', enum: ['low', 'medium', 'high'], example: 'medium' },
            status: { type: 'string', enum: ['open', 'reviewed', 'dismissed'], example: 'open' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } } },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: { tags: ['Health'], summary: 'Health check', responses: { 200: { description: 'Server is running' } } }
      },
      '/api/auth/signup': {
        post: { tags: ['Authentication'], summary: 'Create a new account', description: 'Register a new user. Sends an OTP to email for verification.', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password', 'name'], properties: { name: { type: 'string', example: 'Ibrahim Chhapra' }, email: { type: 'string', format: 'email', example: 'ibrahim@trimerge.com' }, password: { type: 'string', example: 'Password123', description: 'Min 8 chars, 1 uppercase, 1 number' }, phone: { type: 'string', example: '+13051234567' } } } } } }, responses: { 201: { description: 'Account created. OTP sent to email.' }, 409: { description: 'Email already registered' }, 422: { description: 'Validation failed' } } }
      },
      '/api/auth/verify-otp': {
        post: { tags: ['Authentication'], summary: 'Verify OTP', description: 'Verify the 6-digit OTP sent after signup.', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'otp'], properties: { email: { type: 'string', format: 'email', example: 'ibrahim@trimerge.com' }, otp: { type: 'string', example: '847291' } } } } } }, responses: { 200: { description: 'Email verified' }, 400: { description: 'Invalid OTP' }, 410: { description: 'OTP expired' }, 429: { description: 'Too many attempts' } } }
      },
      '/api/auth/resend-otp': {
        post: { tags: ['Authentication'], summary: 'Resend OTP', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email', example: 'ibrahim@trimerge.com' } } } } } }, responses: { 200: { description: 'OTP resent' }, 429: { description: 'Cooldown active' } } }
      },
      '/api/auth/login': {
        post: { tags: ['Authentication'], summary: 'Log in', description: 'Returns access token (15m) and refresh token (7d). Locks after 5 failed attempts.', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email', example: 'ibrahim@trimerge.com' }, password: { type: 'string', example: 'Password123' } } } } } }, responses: { 200: { description: 'Login successful — returns accessToken and refreshToken' }, 401: { description: 'Invalid credentials' }, 403: { description: 'Email not verified' }, 423: { description: 'Account locked' } } }
      },
      '/api/auth/refresh': {
        post: { tags: ['Authentication'], summary: 'Refresh tokens', description: 'Exchange refresh token for new access + refresh tokens. Old token is invalidated.', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string', example: 'eyJhbGci...' } } } } } }, responses: { 200: { description: 'New tokens issued' }, 401: { description: 'Invalid refresh token' } } }
      },
      '/api/auth/forgot-password': {
        post: { tags: ['Password Reset'], summary: 'Request password reset', description: 'Sends reset link to email. Always returns 200 to prevent user enumeration.', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email', example: 'ibrahim@trimerge.com' } } } } } }, responses: { 200: { description: 'Reset link sent' }, 422: { description: 'Validation failed' } } }
      },
      '/api/auth/reset-password': {
        post: { tags: ['Password Reset'], summary: 'Reset password', description: 'Set new password using token from email. Invalidates all active sessions.', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['token', 'newPassword'], properties: { token: { type: 'string', example: 'a1b2c3...' }, newPassword: { type: 'string', example: 'NewPassword123' } } } } } }, responses: { 200: { description: 'Password reset successful' }, 400: { description: 'Invalid or expired token' }, 422: { description: 'Validation failed' } } }
      },
      '/api/auth/logout': {
        post: { tags: ['Authentication'], summary: 'Log out', description: 'Invalidates refresh token. Requires valid access token.', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Logged out successfully' }, 401: { description: 'Unauthorized' } } }
      },
      '/api/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current user',
          description: 'Returns the authenticated user profile. Requires valid access token.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'User profile returned',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized — missing or invalid token' },
          },
        },
      },
      '/api/auth/users/{id}/role': {
        patch: {
          tags: ['Authentication'],
          summary: 'Update user role',
          description: 'Update a user role. Admin only.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '64f1a2b3c4d5e6f7a8b9c0d1' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['role'],
                  properties: {
                    role: { type: 'string', enum: ['admin', 'analyst', 'viewer'], example: 'analyst' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'User role updated successfully' },
            400: { description: 'Invalid role' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            404: { description: 'User not found' },
          },
        },
      },
      '/api/upload/csv': {
        post: {
          tags: ['CSV Upload'],
          summary: 'Process adverse impact CSV',
          description: 'Upload a CSV file and run validation plus analytics processing.',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file'],
                  properties: {
                    file: { type: 'string', format: 'binary', description: 'CSV file with columns: group, selected, total' },
                  },
                },
              },
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['csvText'],
                  properties: {
                    csvText: { type: 'string', example: 'group,selected,total\nMale,80,100\nFemale,30,50' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'CSV processed successfully' },
            400: { description: 'Missing CSV content' },
            422: { description: 'CSV validation failed' },
            500: { description: 'CSV processing or Cloudinary storage failed' },
          },
        },
      },
      '/api/position/upload': {
        post: {
          tags: ['Position Description AI'],
          summary: 'Upload and analyze a position description',
          description: 'Upload a .txt, .csv, .pdf, or .docx position description. The document is stored in Cloudinary. If OPENAI_API_KEY is configured, OpenAI returns structured compliance findings.',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file'],
                  properties: {
                    file: { type: 'string', format: 'binary', description: 'Position description file (.txt, .csv, .pdf, or .docx)' },
                  },
                },
              },
              'text/plain': {
                schema: { type: 'string', example: 'Customer Success Manager\nMust be energetic with 15 years of experience.' },
              },
            },
          },
          responses: {
            200: { description: 'Position document uploaded and stored.' },
            400: { description: 'Missing position document content' },
            415: { description: 'Unsupported file type' },
            422: { description: 'Uploaded document did not contain readable text' },
            500: { description: 'Position upload, storage, or AI analysis failed' },
          },
        },
      },
      '/api/audits': {
        post: {
          tags: ['Audits'],
          summary: 'Create audit',
          description: 'Create a new audit. Requires analyst or admin role.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', example: 'Q1 2026 Pay Equity Review' },
                    description: { type: 'string', example: 'Initial audit for Q1 payroll data' },
                    organization: { type: 'string', example: 'TriMerge Consulting' },
                    clientName: { type: 'string', example: 'ABC Corporation' },
                    auditType: { type: 'string', example: 'Compliance Audit' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Audit created successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — insufficient role' },
          },
        },
        get: {
          tags: ['Audits'],
          summary: 'List all audits',
          description: 'Returns all audits. Supports filtering by clientName and auditType.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'clientName', in: 'query', schema: { type: 'string' }, description: 'Filter by client name (case-insensitive, partial match)' },
            { name: 'auditType', in: 'query', schema: { type: 'string' }, description: 'Filter by audit type (case-insensitive, partial match)' },
          ],
          responses: {
            200: { description: 'Audits retrieved successfully' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/audits/{id}': {
        get: {
          tags: ['Audits'],
          summary: 'Get audit by ID',
          description: 'Returns a single audit by ID.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '64f1a2b3c4d5e6f7a8b9c0d1' }],
          responses: {
            200: { description: 'Audit retrieved successfully' },
            401: { description: 'Unauthorized' },
            404: { description: 'Audit not found' },
          },
        },
        patch: {
          tags: ['Audits'],
          summary: 'Update audit',
          description: 'Update audit fields. Requires analyst or admin role.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '64f1a2b3c4d5e6f7a8b9c0d1' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Q1 2026 Pay Equity Review — Updated' },
                    description: { type: 'string', example: 'Updated description' },
                    organization: { type: 'string', example: 'TriMerge Consulting' },
                    clientName: { type: 'string', example: 'ABC Corporation' },
                    auditType: { type: 'string', example: 'Compliance Audit' },
                    status: { type: 'string', enum: ['draft', 'processing', 'completed', 'flagged'], example: 'processing' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Audit updated successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — insufficient role' },
            404: { description: 'Audit not found' },
          },
        },
        delete: {
          tags: ['Audits'],
          summary: 'Delete audit',
          description: 'Permanently delete an audit. Requires admin role.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '64f1a2b3c4d5e6f7a8b9c0d1' }],
          responses: {
            200: { description: 'Audit deleted successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            404: { description: 'Audit not found' },
          },
        },
      },
      '/api/flags': {
        get: {
          tags: ['Flags'],
          summary: 'List all flags',
          description: 'Returns flags with optional filters and pagination.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'auditId', in: 'query', schema: { type: 'string' }, description: 'Filter by audit ID' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['open', 'reviewed', 'dismissed'] }, description: 'Filter by status' },
            { name: 'severity', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high'] }, description: 'Filter by severity' },
            { name: 'testType', in: 'query', schema: { type: 'string', enum: ['four_fifths', 'fisher_exact', 'chi_square'] }, description: 'Filter by test type' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Results per page' },
          ],
          responses: {
            200: { description: 'Flags retrieved successfully' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/flags/{id}': {
        get: {
          tags: ['Flags'],
          summary: 'Get flag by ID',
          description: 'Returns a single flag by ID with statistical explanation.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '6a04821729a246ff21797b80' }],
          responses: {
            200: { description: 'Flag retrieved successfully' },
            401: { description: 'Unauthorized' },
            404: { description: 'Flag not found' },
          },
        },
      },
      '/api/flags/{id}/decide': {
        post: {
          tags: ['Analyst Workflow'],
          summary: 'Decide on a flag',
          description: 'Analyst approves or dismisses a flag. Requires analyst or admin role.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '6a04821729a246ff21797b80' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['decision'],
                  properties: {
                    decision: { type: 'string', enum: ['approved', 'dismissed'], example: 'approved' },
                    reason: { type: 'string', example: 'Reviewed and confirmed no adverse impact.' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Flag decided successfully' },
            400: { description: 'Invalid decision or flag already reviewed' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — insufficient role' },
            404: { description: 'Flag not found' },
          },
        },
      },
      '/api/flags/{id}/assign': {
        patch: {
          tags: ['Analyst Workflow'],
          summary: 'Assign flag to analyst',
          description: 'Assign a flag to a specific analyst. Requires analyst or admin role.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '6a04821729a246ff21797b80' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['assignedTo'],
                  properties: {
                    assignedTo: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1', description: 'User ID of the analyst to assign' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Flag assigned successfully' },
            400: { description: 'Missing assignedTo field' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — insufficient role' },
            404: { description: 'Flag not found' },
          },
        },
      },
      '/api/dashboard/summary': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get dashboard summary',
          description: 'Returns total counts, breakdowns by status/severity, and recent audits and flags.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Dashboard summary retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          totalAudits: { type: 'integer', example: 10 },
                          auditsByStatus: { type: 'object', example: { draft: 3, processing: 2, completed: 4, flagged: 1 } },
                          totalFlags: { type: 'integer', example: 42 },
                          flagsBySeverity: { type: 'object', example: { low: 10, medium: 20, high: 12 } },
                          flagsByStatus: { type: 'object', example: { open: 30, reviewed: 8, dismissed: 4 } },
                          recentAudits: { type: 'array', items: { $ref: '#/components/schemas/Audit' } },
                          recentFlags: { type: 'array', items: { $ref: '#/components/schemas/Flag' } },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/dashboard/export': {
        get: {
          tags: ['Dashboard'],
          summary: 'Export dashboard data',
          description: 'Returns all audits and flags for export. Requires analyst or admin role.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Export data retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          audits: { type: 'array', items: { $ref: '#/components/schemas/Audit' } },
                          flags: { type: 'array', items: { $ref: '#/components/schemas/Flag' } },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — insufficient role' },
          },
        },
      },
    },
  },
  apis: [],
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customSiteTitle: 'TriMerge Auth API Docs',
    customCss: '.swagger-ui .topbar { background-color: #1a1a2e; }',
  }));
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
  console.log('[DOCS] Swagger UI at http://localhost:' + (process.env.PORT || 4000) + '/api/docs');
};

module.exports = setupSwagger;
