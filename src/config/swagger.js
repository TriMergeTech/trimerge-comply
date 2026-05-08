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
    servers: [{ url: 'http://localhost:4000', description: 'Development server' }],
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
            createdAt: { type: 'string', format: 'date-time' },
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
        post: { tags: ['Authentication'], summary: 'Create a new account', description: 'Register a new user. Sends an OTP to email for verification.', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email', example: 'ibrahim@trimerge.com' }, password: { type: 'string', example: 'Password123', description: 'Min 8 chars, 1 uppercase, 1 number' }, phone: { type: 'string', example: '+13051234567' } } } } } }, responses: { 201: { description: 'Account created. OTP sent to email.' }, 409: { description: 'Email already registered' }, 422: { description: 'Validation failed' } } }
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
