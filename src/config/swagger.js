const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TriMerge Comply API',
      version: '2.0.0',
      description: `HR Audit & Compliance platform API — Findings, Handbooks, Pay Equity, Adverse Impact, and Position Description analysis.

## Role System

| Role | Label | Access |
|------|-------|--------|
| \`admin\` | Platform Admin | System-wide config, user management, all data |
| \`director\` | Engagement Director | Owns client audits, approves findings, deletes handbooks |
| \`manager\` | Project Manager | Manages audit tasks, assigns flags, exports data |
| \`analyst\` | Analyst | Works findings, uploads evidence, creates audits |
| \`reviewer\` | SME Reviewer | Validates findings before approval (read + decide) |
| \`viewer\` | Client Read-Only | Sees assigned audit reports only |

All protected endpoints require a verified email and a valid Bearer token.`,
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
        DemoRequest: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            firstName: { type: 'string', example: 'Jordan' },
            lastName: { type: 'string', example: 'Lee' },
            workEmail: { type: 'string', format: 'email', example: 'jordan.lee@example.com' },
            organization: { type: 'string', example: 'Example Corporation' },
            jobTitle: { type: 'string', example: 'HR Director' },
            phoneNumber: { type: 'string', example: '+1 305 555 0123' },
            companySize: { type: 'string', example: '201-500 employees' },
            role: { type: 'string', example: 'Human Resources' },
            interests: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'adverse_impact_analysis',
                  'pay_equity_analysis',
                  'position_description_review',
                  'all_of_the_above',
                ],
              },
            },
            additionalDetails: {
              type: 'string',
              example: 'We want to review our hiring and compensation processes.',
            },
            status: {
              type: 'string',
              enum: ['new', 'contacted', 'scheduled', 'closed'],
              example: 'new',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            name: { type: 'string', example: 'Ibrahim Chhapra' },
            companyName: { type: 'string', nullable: true, example: 'TriMerge Consulting' },
            email: { type: 'string', example: 'ibrahim@trimerge.com' },
            phone: { type: 'string', nullable: true },
            isVerified: { type: 'boolean', example: true },
            role: {
              type: 'string',
              enum: ['admin', 'director', 'manager', 'analyst', 'reviewer', 'viewer'],
              description: 'admin=Platform Admin, director=Engagement Director, manager=Project Manager, analyst=Analyst, reviewer=SME Reviewer, viewer=Client Read-Only',
            },
            roleName: {
              type: 'string',
              enum: ['Platform Admin', 'Engagement Director', 'Project Manager', 'Analyst', 'SME Reviewer', 'Client Read-Only'],
              description: 'Human-readable label for the role',
              example: 'Platform Admin',
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Audit: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            name: { type: 'string', example: 'Q1 2026 Pay Equity Review' },
            description: { type: 'string', nullable: true, example: 'Initial audit for Q1 payroll data' },
            status: { type: 'string', enum: ['draft', 'processing', 'completed', 'flagged'] },
            organization: { type: 'string', nullable: true, example: 'TriMerge Consulting' },
            clientName: { type: 'string', nullable: true, example: 'ABC Corporation' },
            auditType: { type: 'string', nullable: true, example: 'Compliance Audit' },
            createdBy: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, role: { type: 'string' }, companyName: { type: 'string' } } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Flag: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            auditId: { type: 'object', nullable: true, description: 'Populated audit object or null', properties: { _id: { type: 'string' }, name: { type: 'string' }, status: { type: 'string' }, organization: { type: 'string' } } },
            uploadId: { type: 'string', nullable: true, example: '6a32e82d00b212443faeafd4', description: 'AdverseImpactAnalysis record this flag was generated from' },
            name: { type: 'string', nullable: true, example: 'Position – Selection – F', description: 'Human-readable label for CSV-based flags' },
            group: { type: 'string', example: 'Female', description: 'Protected demographic group' },
            referenceGroup: { type: 'string', example: 'Male', description: 'Comparison (highest selection rate) group' },
            selected: { type: 'number', nullable: true, example: 30 },
            total: { type: 'number', nullable: true, example: 50 },
            selectionRate: { type: 'number', example: 0.6, description: 'Group selection rate (or four-fifths ratio for CSV flags)' },
            impactRatio: { type: 'number', example: 0.75, description: 'Adverse impact ratio vs reference group' },
            threshold: { type: 'number', example: 0.8, description: 'EEOC four-fifths rule threshold' },
            testType: { type: 'string', enum: ['four_fifths', 'fisher_exact', 'chi_square', 'adverse_impact'] },
            pValue: { type: 'number', nullable: true, example: 0.032 },
            severity: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low'], description: 'Critical: ratio<0.5 | High: ratio<0.6 or p<0.01 | Medium: ratio<0.8 or p<0.05 | Low: borderline' },
            status: { type: 'string', enum: ['open', 'reviewed', 'dismissed'] },
            assignedTo: { type: 'string', nullable: true, example: '64f1a2b3c4d5e6f7a8b9c0d1', description: 'User ID of assigned analyst' },
            results: {
              type: 'object', nullable: true,
              description: 'Raw statistical results for CSV-based adverse impact flags',
              properties: {
                jobTitle: { type: 'string', example: 'Position' },
                stage: { type: 'string', example: 'Selection' },
                demographicGroup: { type: 'string', example: 'F' },
                fourFifthsRule: { type: 'number', example: 0.6364, description: 'Adverse impact ratio (protected group rate / reference group rate)' },
                chiSquare: { type: 'number', example: 3.5152, description: 'Chi-Square statistic (Yates corrected)' },
                fishersExact: { type: 'number', example: 0.1725, description: "Fisher's Exact Test p-value" },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Finding: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            auditId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            flagId: { type: 'string', nullable: true, example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            observation: { type: 'string', example: 'Female applicants selected at a rate of 60% vs 80% for males (impact ratio 0.75).' },
            risk: {
              type: 'object',
              properties: {
                level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], example: 'high' },
                description: { type: 'string', example: 'Potential violation of EEOC 4/5ths Rule.' },
              },
            },
            criteria: { type: 'string', example: 'Per Section 3.2 of the Employee Handbook, all selection processes must comply with EEOC adverse impact guidelines.' },
            recommendation: { type: 'string', example: 'HR Director to conduct a structured review of the selection criteria within 30 days and document findings.' },
            status: { type: 'string', enum: ['new', 'under_review', 'additional_info_required', 'approved', 'rejected', 'closed'], example: 'under_review' },
            handbookReference: {
              type: 'object',
              properties: {
                handbookId: { type: 'string', nullable: true },
                section: { type: 'string', example: 'Handbook: Employee Handbook 2024' },
                excerpt: { type: 'string', example: 'All hiring decisions must be made without regard to gender...' },
              },
            },
            aiDrafted: { type: 'boolean', example: true },
            analystNotes: { type: 'string', example: 'Discussed with hiring manager on 2026-06-01.' },
            createdBy: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, role: { type: 'string' } } },
            assignedTo: { type: 'object', nullable: true, properties: { name: { type: 'string' }, email: { type: 'string' } } },
            reviewedBy: { type: 'object', nullable: true, properties: { name: { type: 'string' }, email: { type: 'string' } } },
            reviewedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Handbook: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            name: { type: 'string', example: 'Employee Handbook 2024' },
            fileName: { type: 'string', example: 'employee-handbook-2024.pdf' },
            mimeType: { type: 'string', example: 'application/pdf' },
            sizeBytes: { type: 'number', example: 1048576 },
            textLength: { type: 'number', example: 45230 },
            chunkCount: { type: 'number', example: 112 },
            status: { type: 'string', enum: ['processing', 'ready', 'failed'], example: 'ready' },
            uploadedBy: {
              type: 'object',
              properties: {
                email: { type: 'string', example: 'ibrahim@trimerge.com' },
                companyName: { type: 'string', example: 'TriMerge Consulting' },
                role: { type: 'string', example: 'admin' },
              },
            },
            storage: { type: 'object', properties: { secureUrl: { type: 'string' }, publicId: { type: 'string' } } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 42 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            totalPages: { type: 'integer', example: 3 },
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
        get: { tags: ['Health'], summary: 'Health check', responses: { 200: { description: 'Server is running' } } },
      },
      '/api/demo-requests': {
        post: {
          tags: ['Demo Requests'],
          summary: 'Submit a demo request',
          description: 'Public endpoint used by the Request Demo website form. Limited to 10 submissions per hour per client.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: [
                    'firstName',
                    'lastName',
                    'workEmail',
                    'organization',
                    'jobTitle',
                    'companySize',
                    'role',
                  ],
                  properties: {
                    firstName: { type: 'string', maxLength: 80, example: 'Jordan' },
                    lastName: { type: 'string', maxLength: 80, example: 'Lee' },
                    workEmail: { type: 'string', format: 'email', example: 'jordan.lee@example.com' },
                    organization: { type: 'string', maxLength: 160, example: 'Example Corporation' },
                    jobTitle: { type: 'string', maxLength: 120, example: 'HR Director' },
                    phoneNumber: { type: 'string', maxLength: 40, example: '+1 305 555 0123' },
                    companySize: { type: 'string', maxLength: 80, example: '201-500 employees' },
                    role: { type: 'string', maxLength: 100, example: 'Human Resources' },
                    interests: {
                      type: 'array',
                      maxItems: 4,
                      items: {
                        type: 'string',
                        enum: [
                          'adverse_impact_analysis',
                          'pay_equity_analysis',
                          'position_description_review',
                          'all_of_the_above',
                        ],
                      },
                    },
                    additionalDetails: {
                      type: 'string',
                      maxLength: 2000,
                      example: 'We want to review our hiring and compensation processes.',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Demo request submitted successfully' },
            422: { description: 'Validation failed' },
            429: { description: 'Too many demo requests submitted' },
          },
        },
        get: {
          tags: ['Demo Requests'],
          summary: 'List demo requests',
          description: 'Returns demo requests newest first. Requires manager, director, or admin role.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['new', 'contacted', 'scheduled', 'closed'] },
              description: 'Filter by request status.',
            },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', minimum: 1, default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            },
          ],
          responses: {
            200: { description: 'Demo requests retrieved successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - manager, director, or admin required' },
            422: { description: 'Invalid status filter' },
          },
        },
      },
      '/api/demo-requests/{id}/status': {
        patch: {
          tags: ['Demo Requests'],
          summary: 'Update demo request status',
          description: 'Moves a demo request through the forward workflow: new to contacted, contacted to scheduled, and scheduled to closed. Requires manager, director, or admin role.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              example: '64f1a2b3c4d5e6f7a8b9c0d1',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['new', 'contacted', 'scheduled', 'closed'],
                      example: 'contacted',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Demo request status updated successfully' },
            400: { description: 'Invalid id or invalid status transition' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - manager, director, or admin required' },
            404: { description: 'Demo request not found' },
            422: { description: 'Status validation failed' },
          },
        },
      },
      '/api/auth/signup': {
        post: {
          tags: ['Authentication'],
          summary: 'Create a new account',
          description: 'Register a new user. Sends an OTP to email for verification.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'name'],
                  properties: {
                    name: { type: 'string', example: 'Ibrahim Chhapra' },
                    companyName: { type: 'string', example: 'TriMerge Consulting' },
                    email: { type: 'string', format: 'email', example: 'ibrahim@trimerge.com' },
                    password: { type: 'string', example: 'Password123', description: 'Min 8 chars, 1 uppercase, 1 number' },
                    phone: { type: 'string', example: '+13051234567' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Account created. OTP sent to email.' }, 409: { description: 'Email already registered' }, 422: { description: 'Validation failed' } },
        },
      },
      '/api/auth/verify-otp': {
        post: { tags: ['Authentication'], summary: 'Verify OTP', description: 'Verify the 6-digit OTP sent after signup.', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'otp'], properties: { email: { type: 'string', format: 'email', example: 'ibrahim@trimerge.com' }, otp: { type: 'string', example: '847291' } } } } } }, responses: { 200: { description: 'Email verified' }, 400: { description: 'Invalid OTP' }, 410: { description: 'OTP expired' }, 429: { description: 'Too many attempts' } } },
      },
      '/api/auth/resend-otp': {
        post: { tags: ['Authentication'], summary: 'Resend OTP', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email', example: 'ibrahim@trimerge.com' } } } } } }, responses: { 200: { description: 'OTP resent' }, 429: { description: 'Cooldown active' } } },
      },
      '/api/auth/login': {
        post: { tags: ['Authentication'], summary: 'Log in', description: 'Returns access token (15m) and refresh token (7d). Locks after 5 failed attempts.', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email', example: 'ibrahim@trimerge.com' }, password: { type: 'string', example: 'Password123' } } } } } }, responses: { 200: { description: 'Login successful' }, 401: { description: 'Invalid credentials' }, 403: { description: 'Email not verified' }, 423: { description: 'Account locked' } } },
      },
      '/api/auth/refresh': {
        post: { tags: ['Authentication'], summary: 'Refresh tokens', description: 'Exchange refresh token for new tokens.', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string', example: 'eyJhbGci...' } } } } } }, responses: { 200: { description: 'New tokens issued' }, 401: { description: 'Invalid refresh token' } } },
      },
      '/api/auth/forgot-password': {
        post: { tags: ['Password Reset'], summary: 'Request password reset', description: 'Sends reset link to email.', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email', example: 'ibrahim@trimerge.com' } } } } } }, responses: { 200: { description: 'Reset link sent' }, 422: { description: 'Validation failed' } } },
      },
      '/api/auth/reset-password': {
        post: { tags: ['Password Reset'], summary: 'Reset password', description: 'Set new password using token from email.', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['token', 'newPassword'], properties: { token: { type: 'string', example: 'a1b2c3...' }, newPassword: { type: 'string', example: 'NewPassword123' } } } } } }, responses: { 200: { description: 'Password reset successful' }, 400: { description: 'Invalid or expired token' }, 422: { description: 'Validation failed' } } },
      },
      '/api/auth/logout': {
        post: { tags: ['Authentication'], summary: 'Log out', description: 'Invalidates refresh token.', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Logged out successfully' }, 401: { description: 'Unauthorized' } } },
      },
      '/api/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current user',
          description: 'Returns the authenticated user profile.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'User profile returned', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } } } } } } },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/auth/change-password': {
        patch: {
          tags: ['Authentication'],
          summary: 'Request password change',
          description: 'Verifies old password and sends OTP to email to confirm the change.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['oldPassword', 'newPassword'],
                  properties: {
                    oldPassword: { type: 'string', example: 'Password123' },
                    newPassword: { type: 'string', example: 'NewPassword456' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'OTP sent to email for confirmation' }, 400: { description: 'Missing fields' }, 401: { description: 'Old password incorrect' }, 429: { description: 'OTP cooldown active' } },
        },
      },
      '/api/auth/change-password/verify': {
        post: {
          tags: ['Authentication'],
          summary: 'Verify and complete password change',
          description: 'Submit the OTP received by email to finalize the password change.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['otp'],
                  properties: {
                    otp: { type: 'string', example: '847291' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Password changed successfully. Please log in again.' }, 400: { description: 'Invalid OTP' }, 410: { description: 'OTP or session expired' }, 429: { description: 'Too many attempts' } },
        },
      },
      '/api/auth/change-name': {
        patch: {
          tags: ['Authentication'],
          summary: 'Update display name',
          description: 'Update the authenticated user\'s display name. Company name cannot be changed via this endpoint.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', example: 'Ibrahim Chhapra' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Profile updated successfully' }, 400: { description: 'Name is required' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/api/auth/users': {
        get: {
          tags: ['User Management'],
          summary: 'Get all users in company',
          description: 'Returns all users scoped to the authenticated user\'s company. Requires manager, director, or admin role.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Users retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          users: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
                                name: { type: 'string', example: 'Ibrahim Chhapra' },
                                email: { type: 'string', example: 'ibrahim@trimerge.com' },
                                role: { type: 'string', enum: ['admin', 'director', 'manager', 'analyst', 'reviewer', 'viewer'] },
                                roleName: { type: 'string', example: 'Platform Admin', description: 'Human-readable role label' },
                                companyName: { type: 'string', nullable: true, example: 'TriMerge Consulting' },
                                isVerified: { type: 'boolean', example: true },
                                createdAt: { type: 'string', format: 'date-time' },
                              },
                            },
                          },
                          total: { type: 'integer', example: 5 },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — manager, director, or admin required' },
          },
        },
      },
      '/api/auth/users/{id}/role': {
        patch: {
          tags: ['User Management'],
          summary: 'Update user role',
          description: 'Assign one of the 6 platform roles to a user within the same company. Admin only.',
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
                    role: {
                      type: 'string',
                      enum: ['admin', 'director', 'manager', 'analyst', 'reviewer', 'viewer'],
                      description: 'admin=Platform Admin | director=Engagement Director | manager=Project Manager | analyst=Analyst | reviewer=SME Reviewer | viewer=Client Read-Only',
                    },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'User role updated successfully' }, 400: { description: 'Invalid role' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden — admin only' }, 404: { description: 'User not found' } },
        },
      },
      '/api/upload/csv': {
        get: {
          tags: ['CSV Upload'],
          summary: 'List adverse impact analyses',
          description: 'Returns all adverse impact CSV analyses for the authenticated user\'s company, sorted newest first. Requires analyst role or above.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Analyses retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      analyses: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            fileName: { type: 'string', example: 'q1-adverse-impact.csv' },
                            datasetType: { type: 'string', example: 'grouped_adverse_impact' },
                            status: { type: 'string', enum: ['processed', 'failed'] },
                            uploadedBy: { type: 'string', example: 'analyst@trimerge.com' },
                            summary: { type: 'object' },
                            warnings: { type: 'array', items: { type: 'object' } },
                            date: { type: 'string', format: 'date-time' },
                          },
                        },
                      },
                      total: { type: 'integer', example: 3 },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['CSV Upload'],
          summary: 'Process adverse impact CSV',
          description: 'Upload a CSV file and run validation plus analytics processing. Results are saved for later retrieval. Requires analyst, manager, director, or admin role.',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary', description: 'CSV file with columns: group, selected, total' } } } }, 'application/json': { schema: { type: 'object', required: ['csvText'], properties: { csvText: { type: 'string', example: 'group,selected,total\nMale,80,100\nFemale,30,50' } } } } } },
          responses: {
            200: { description: 'CSV processed successfully — analysisId included in response' },
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
          description: 'Upload a .txt, .csv, .pdf, or .docx position description. Requires analyst, manager, director, or admin role.',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary', description: 'Position description file (.txt, .csv, .pdf, or .docx)' } } } }, 'text/plain': { schema: { type: 'string', example: 'Customer Success Manager\nMust be energetic with 15 years of experience.' } } } },
          responses: { 200: { description: 'Position document uploaded and stored.' }, 400: { description: 'Missing content' }, 415: { description: 'Unsupported file type' }, 422: { description: 'No readable text' }, 500: { description: 'Upload or AI analysis failed' } },
        },
      },
      '/api/position': {
        get: {
          tags: ['Position Description AI'],
          summary: 'List position description analyses',
          description: 'Returns position analysis rows for the authenticated user\'s company, sorted newest first. All internal roles and viewer can access.',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Position documents retrieved successfully' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/api/position/{id}': {
        get: {
          tags: ['Position Description AI'],
          summary: 'Get position analysis detail view',
          description: 'Returns the detail payload for one position document scoped to the user\'s company.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '6a0f1185927a7ccf9ab71252' }],
          responses: { 200: { description: 'Position document detail retrieved successfully' }, 401: { description: 'Unauthorized' }, 404: { description: 'Position document not found' } },
        },
      },
      '/api/position/{id}/review': {
        patch: {
          tags: ['Position Description AI'],
          summary: 'Update analyst review fields',
          description: 'Updates review fields on a position document. Requires analyst, manager, director, or admin role.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '6a0f1185927a7ccf9ab71252' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    analystNotes: { type: 'string', example: 'Reviewed flagged issues.' },
                    resolutionStatus: { type: 'string', enum: ['not_reviewed', 'in_review', 'approved', 'needs_changes', 'dismissed'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Position document review updated successfully' }, 400: { description: 'Missing review fields' }, 404: { description: 'Position document not found' }, 422: { description: 'Invalid resolution status' } },
        },
      },
      '/api/position/{id}/standards-review': {
        post: {
          tags: ['Position Description AI'],
          summary: 'Run government posting standards review',
          description: 'Compares a saved position description against a concise USAJOBS-style government job posting checklist and returns only the most important issues. Requires analyst, reviewer, manager, director, or admin role.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '6a0f1185927a7ccf9ab71252' },
          ],
          responses: {
            200: {
              description: 'Position standards review completed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: {
                          documentId: { type: 'string', example: '6a0f1185927a7ccf9ab71252' },
                          aiConfigured: { type: 'boolean', example: true },
                          standardsReview: {
                            type: 'object',
                            properties: {
                              standardId: { type: 'string', example: 'usajobs_federal_announcement_v1' },
                              standardName: { type: 'string', example: 'USAJOBS Federal Job Announcement Structure' },
                              overallReadiness: { type: 'string', enum: ['ready', 'minor_revision', 'needs_revision'], example: 'needs_revision' },
                              score: { type: 'integer', example: 68 },
                              summary: { type: 'string', example: 'The posting needs clearer application instructions and benefits information.' },
                              issues: {
                                type: 'array',
                                maxItems: 5,
                                items: {
                                  type: 'object',
                                  properties: {
                                    section: { type: 'string', example: 'Benefits' },
                                    severity: { type: 'string', enum: ['low', 'medium', 'high'], example: 'medium' },
                                    issue: { type: 'string', example: 'Benefits information is missing.' },
                                    recommendation: { type: 'string', example: 'Add a short benefits section covering health, retirement, leave, and insurance eligibility.' },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Invalid position document id' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - insufficient role' },
            404: { description: 'Position document not found' },
            422: { description: 'Full extracted text unavailable for older upload' },
            500: { description: 'AI standards review failed' },
          },
        },
      },
      '/api/position/{id}/report': {
        get: {
          tags: ['Position Description AI'],
          summary: 'Download position analysis PDF report',
          description: 'Downloads a one-page official compliance PDF report. Scoped to user\'s company.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '6a0f1185927a7ccf9ab71252' }],
          responses: { 200: { description: 'PDF report downloaded successfully', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } }, 400: { description: 'Invalid position document id' }, 404: { description: 'Position document not found' } },
        },
      },
      '/api/payequity/upload': {
        post: {
          tags: ['Pay Equity'],
          summary: 'Upload and analyze compensation file',
          description: 'Upload compensation data. Runs OLS regression and returns adjusted pay gap findings. Requires analyst, manager, director, or admin role.',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary', description: 'Compensation file. Required column: salary.' } } } }, 'text/csv': { schema: { type: 'string', example: 'salary,grade,tenure,performance,gender,race,department\n85000,4,5,4,Female,Black,Finance\n90000,4,6,4,Male,White,Finance' } } } },
          responses: { 200: { description: 'Pay equity file uploaded and analyzed successfully' }, 400: { description: 'Missing content' }, 422: { description: 'Validation failed' }, 500: { description: 'Upload or regression analysis failed' } },
        },
      },
      '/api/payequity': {
        get: {
          tags: ['Pay Equity'],
          summary: 'List pay equity analyses',
          description: 'Returns pay equity analyses for the authenticated user\'s company. Requires analyst, reviewer, manager, director, or admin role.',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Pay equity analyses retrieved successfully' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden — viewer cannot access pay equity data' } },
        },
      },
      '/api/payequity/{id}/report': {
        get: {
          tags: ['Pay Equity'],
          summary: 'Download pay equity PDF report',
          description: 'Downloads a two-page statistical pay equity report with deterministic analysis results, concise AI recommendations when available, and deterministic fallback recommendations. Scoped to the authenticated user\'s company.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '6a0f1185927a7ccf9ab71252' },
          ],
          responses: {
            200: {
              description: 'Pay equity PDF report downloaded successfully',
              content: {
                'application/pdf': {
                  schema: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
            },
            400: { description: 'Invalid pay equity analysis id' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - insufficient role' },
            404: { description: 'Pay equity analysis not found' },
          },
        },
      },
      '/api/audits': {
        post: {
          tags: ['Audits'],
          summary: 'Create audit',
          description: 'Create a new audit. Requires analyst, manager, director, or admin role.',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string', example: 'Q1 2026 Pay Equity Review' }, description: { type: 'string', example: 'Initial audit for Q1 payroll data' }, organization: { type: 'string', example: 'TriMerge Consulting' }, clientName: { type: 'string', example: 'ABC Corporation' }, auditType: { type: 'string', example: 'Compliance Audit' } } } } } },
          responses: { 201: { description: 'Audit created successfully' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden — insufficient role' } },
        },
        get: {
          tags: ['Audits'],
          summary: 'List all audits',
          description: 'Returns all audits. Supports filtering by auditName, clientName, auditType and status.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'auditName', in: 'query', schema: { type: 'string' }, description: 'Filter by audit name (case-insensitive, partial match)' },
            { name: 'clientName', in: 'query', schema: { type: 'string' }, description: 'Filter by client name or organization (case-insensitive, partial match)' },
            { name: 'auditType', in: 'query', schema: { type: 'string' }, description: 'Filter by audit type (case-insensitive, partial match)' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['draft', 'processing', 'completed', 'flagged'] }, description: 'Filter by status' },
          ],
          responses: { 200: { description: 'Audits retrieved successfully' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/api/audits/export': {
        get: {
          tags: ['Audits'],
          summary: 'Export audits as CSV',
          description: 'Downloads audits as a CSV file. Filter by status, clientName, auditType, auditName, or specific IDs.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['draft', 'processing', 'completed', 'flagged'] }, description: 'Filter by status' },
            { name: 'auditName', in: 'query', schema: { type: 'string' }, description: 'Filter by audit name' },
            { name: 'clientName', in: 'query', schema: { type: 'string' }, description: 'Filter by client name' },
            { name: 'auditType', in: 'query', schema: { type: 'string' }, description: 'Filter by audit type' },
            { name: 'ids', in: 'query', schema: { type: 'string' }, description: 'Comma-separated list of audit IDs to export' },
          ],
          responses: {
            200: { description: 'CSV file download', content: { 'text/csv': { schema: { type: 'string', format: 'binary' } } } },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — insufficient role' },
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
          responses: { 200: { description: 'Audit retrieved successfully' }, 401: { description: 'Unauthorized' }, 404: { description: 'Audit not found' } },
        },
        patch: {
          tags: ['Audits'],
          summary: 'Update audit',
          description: 'Update audit fields. Analysts can only update their own audits.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '64f1a2b3c4d5e6f7a8b9c0d1' }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string', example: 'Q1 2026 Pay Equity Review — Updated' }, description: { type: 'string', example: 'Updated description' }, organization: { type: 'string', example: 'TriMerge Consulting' }, clientName: { type: 'string', example: 'ABC Corporation' }, auditType: { type: 'string', example: 'Compliance Audit' }, status: { type: 'string', enum: ['draft', 'processing', 'completed', 'flagged'] } } } } } },
          responses: { 200: { description: 'Audit updated successfully' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden — not your audit' }, 404: { description: 'Audit not found' } },
        },
        delete: {
          tags: ['Audits'],
          summary: 'Delete audit',
          description: 'Analysts can only delete their own audits. Admins can delete any.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '64f1a2b3c4d5e6f7a8b9c0d1' }],
          responses: { 200: { description: 'Audit deleted successfully' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden — not your audit' }, 404: { description: 'Audit not found' } },
        },
      },
      '/api/flags': {
        get: {
          tags: ['Flags'],
          summary: 'List all flags',
          description: 'Returns flags for the authenticated user\'s organization with optional filters and pagination. Severity filter accepts either case (Critical or critical).',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'auditId', in: 'query', schema: { type: 'string' }, description: 'Filter by audit ID', example: '6a033027cae47de2a0f1abc4' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['open', 'reviewed', 'dismissed'] }, description: 'Filter by status' },
            { name: 'severity', in: 'query', schema: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] }, description: 'Filter by severity (case-insensitive)' },
            { name: 'testType', in: 'query', schema: { type: 'string', enum: ['four_fifths', 'fisher_exact', 'chi_square', 'adverse_impact'] }, description: 'Filter by test type' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 }, description: 'Results per page (max 100)' },
          ],
          responses: {
            200: {
              description: 'Flags retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          flags: { type: 'array', items: { $ref: '#/components/schemas/Flag' } },
                          total: { type: 'integer', example: 57, description: 'Total matching flags across all pages' },
                          pagination: {
                            type: 'object',
                            properties: {
                              total: { type: 'integer', example: 57 },
                              page: { type: 'integer', example: 1 },
                              limit: { type: 'integer', example: 20 },
                              totalPages: { type: 'integer', example: 3 },
                            },
                          },
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
      '/api/flags/{id}': {
        get: {
          tags: ['Flags'],
          summary: 'Get flag by ID',
          description: 'Returns a single flag by its own ID with a plain-English statistical explanation. Severity is title-cased in the response (Critical/High/Medium/Low).',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '6a04821729a246ff21797b80' }],
          responses: {
            200: {
              description: 'Flag retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          flag: { $ref: '#/components/schemas/Flag' },
                          explanation: { type: 'string', example: 'The Female group has a selection rate of 60.0% compared to the reference group (Male), resulting in an impact ratio of 75.0% — below the 80.0% threshold, indicating potential adverse impact. Fisher\'s Exact Test p-value: 0.032 (statistically significant). This flag is rated MEDIUM severity and should be reviewed promptly.' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            404: { description: 'Flag not found' },
          },
        },
      },
      '/api/flags/{id}/decide': {
        post: {
          tags: ['Analyst Workflow'],
          summary: 'Decide on a flag',
          description: 'Approve or dismiss a flag. Requires analyst, reviewer, manager, director, or admin role.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '6a04821729a246ff21797b80' }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['decision'], properties: { decision: { type: 'string', enum: ['approved', 'dismissed'] }, reason: { type: 'string', example: 'Reviewed and confirmed no adverse impact.' } } } } } },
          responses: { 200: { description: 'Flag decided successfully' }, 400: { description: 'Invalid decision or flag already reviewed' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden — insufficient role' }, 404: { description: 'Flag not found' } },
        },
      },
      '/api/flags/{id}/assign': {
        patch: {
          tags: ['Analyst Workflow'],
          summary: 'Assign flag to analyst',
          description: 'Assign a flag to a team member. Requires manager, director, or admin role.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '6a04821729a246ff21797b80' }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['assignedTo'], properties: { assignedTo: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1', description: 'User ID of the analyst to assign' } } } } } },
          responses: { 200: { description: 'Flag assigned successfully' }, 400: { description: 'Missing assignedTo field' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden — insufficient role' }, 404: { description: 'Flag not found' } },
        },
      },
      '/api/dashboard/summary': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get dashboard summary',
          description: 'Returns total counts, breakdowns by status/severity, risk summaries, and recent audits and flags.',
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
                          overallRisk: { type: 'string', enum: ['high', 'medium', 'low', 'none'] },
                          auditRiskSummaries: { type: 'array', items: { type: 'object' } },
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
          summary: 'Export dashboard data as CSV',
          description: 'Downloads all audits and flags as a formatted CSV file. Requires manager, director, or admin role.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'CSV file download', content: { 'text/csv': { schema: { type: 'string', format: 'binary' } } } },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — insufficient role' },
          },
        },
      },
      '/api/audits/{id}/findings': {
        get: {
          tags: ['Findings'],
          summary: 'List findings for an audit',
          description: 'Returns all findings scoped to a specific audit. Supports pagination, status and risk level filters.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '64f1a2b3c4d5e6f7a8b9c0d1', description: 'Audit ID' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['new', 'under_review', 'additional_info_required', 'approved', 'rejected', 'closed'] } },
            { name: 'riskLevel', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            200: { description: 'Findings retrieved successfully', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { findings: { type: 'array', items: { $ref: '#/components/schemas/Finding' } }, pagination: { $ref: '#/components/schemas/Pagination' } } } } } } } },
            401: { description: 'Unauthorized' },
            404: { description: 'Audit not found' },
          },
        },
      },
      '/api/audits/{id}/report': {
        get: {
          tags: ['Findings'],
          summary: 'Download Findings Register PDF',
          description: 'Streams a branded PDF Findings Register for the audit — cover page, KPI summary, and one block per finding. This is the deliverable handed to clients.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '64f1a2b3c4d5e6f7a8b9c0d1', description: 'Audit ID' },
          ],
          responses: {
            200: { description: 'PDF streamed successfully', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } },
            401: { description: 'Unauthorized' },
            404: { description: 'Audit not found' },
          },
        },
      },
      '/api/findings': {
        get: {
          tags: ['Findings'],
          summary: 'List all findings',
          description: 'Returns findings across all audits scoped to the authenticated user\'s company. Filter by auditId, status, or risk level.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'auditId', in: 'query', schema: { type: 'string' }, description: 'Filter by audit ID' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['new', 'under_review', 'additional_info_required', 'approved', 'rejected', 'closed'] } },
            { name: 'riskLevel', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          ],
          responses: {
            200: { description: 'Findings retrieved successfully', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { findings: { type: 'array', items: { $ref: '#/components/schemas/Finding' } }, pagination: { $ref: '#/components/schemas/Pagination' } } } } } } } },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Findings'],
          summary: 'Create a finding',
          description: 'Creates a finding for an audit. Optionally linked to a flag. Automatically searches company handbooks and uses GPT-4o-mini to draft criteria and recommendation fields. Analyst must review before approving.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['auditId', 'observation'],
                  properties: {
                    auditId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
                    flagId: { type: 'string', nullable: true, example: '64f1a2b3c4d5e6f7a8b9c0d1', description: 'Optional — links finding to a statistical flag' },
                    observation: { type: 'string', example: 'Female applicants selected at 60% vs 80% for males (impact ratio 0.75, below the 4/5ths threshold).' },
                    risk: {
                      type: 'object',
                      properties: {
                        level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], example: 'high' },
                        description: { type: 'string', example: 'Potential EEOC violation with exposure to disparate impact claim.' },
                      },
                    },
                    analystNotes: { type: 'string', example: 'Initial review notes.' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Finding created. AI-drafted criteria and recommendation included if OPENAI_API_KEY is configured.', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'object', properties: { finding: { $ref: '#/components/schemas/Finding' } } } } } } } },
            400: { description: 'Missing auditId or observation' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — analyst, manager, director, or admin required' },
            404: { description: 'Audit or flag not found' },
          },
        },
      },
      '/api/findings/{id}': {
        get: {
          tags: ['Findings'],
          summary: 'Get finding by ID',
          description: 'Returns a single finding with all populated references (audit, flag, handbook, users).',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '64f1a2b3c4d5e6f7a8b9c0d1' }],
          responses: {
            200: { description: 'Finding retrieved successfully', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { finding: { $ref: '#/components/schemas/Finding' } } } } } } } },
            401: { description: 'Unauthorized' },
            404: { description: 'Finding not found' },
          },
        },
        patch: {
          tags: ['Findings'],
          summary: 'Update finding fields',
          description: 'Edit observation, risk, criteria, recommendation, analystNotes, or assignedTo. Cannot edit findings with status approved, rejected, or closed.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    observation: { type: 'string' },
                    risk: { type: 'object', properties: { level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }, description: { type: 'string' } } },
                    criteria: { type: 'string', description: 'AI-drafted — analyst should review and edit.' },
                    recommendation: { type: 'string', description: 'AI-drafted — analyst should review and edit.' },
                    analystNotes: { type: 'string' },
                    assignedTo: { type: 'string', nullable: true, description: 'User ID of analyst to assign' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Finding updated successfully' },
            400: { description: 'Finding is in a terminal status and cannot be edited' },
            401: { description: 'Unauthorized' },
            404: { description: 'Finding not found' },
          },
        },
      },
      '/api/findings/{id}/status': {
        patch: {
          tags: ['Findings'],
          summary: 'Advance finding status',
          description: 'Transitions a finding through its workflow. Invalid transitions return 400 with allowed next states. Criteria and recommendation must be filled before approving.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['new', 'under_review', 'additional_info_required', 'approved', 'rejected', 'closed'], example: 'approved' },
                    reason: { type: 'string', example: 'Reviewed and confirmed. Corrective plan submitted.' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Status updated successfully' },
            400: { description: 'Invalid transition or missing criteria/recommendation for approval' },
            401: { description: 'Unauthorized' },
            404: { description: 'Finding not found' },
          },
        },
      },
      '/api/findings/{id}/regenerate-draft': {
        post: {
          tags: ['Findings'],
          summary: 'Regenerate AI draft',
          description: 'Re-runs the AI draft for criteria and recommendation using the latest handbook content. The finding is moved back to under_review if it was already approved or rejected.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'AI draft regenerated. Review before approving.' },
            400: { description: 'Cannot regenerate for an approved or closed finding' },
            401: { description: 'Unauthorized' },
            404: { description: 'Finding not found' },
            503: { description: 'OPENAI_API_KEY not configured' },
          },
        },
      },
      '/api/handbooks': {
        get: {
          tags: ['Handbooks'],
          summary: 'List company handbooks',
          description: 'Returns all uploaded handbooks for the authenticated user\'s company. Chunk data is excluded for performance.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Handbooks retrieved successfully', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { handbooks: { type: 'array', items: { $ref: '#/components/schemas/Handbook' } }, total: { type: 'integer' } } } } } } } },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/handbooks/upload': {
        post: {
          tags: ['Handbooks'],
          summary: 'Upload and index a company handbook',
          description: 'Accepts a PDF or DOCX employee handbook. Extracts full text, splits it into 400-word overlapping chunks, stores in MongoDB, and uploads the original to Cloudinary. Chunks are used by the Findings AI to retrieve relevant policy sections when drafting criteria and recommendation.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'x-handbook-name', in: 'header', schema: { type: 'string' }, description: 'Display name for the handbook (e.g. "Employee Handbook 2024"). Falls back to filename if omitted.' },
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': { schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary', description: 'Employee handbook file (.pdf or .docx)' } } } },
              'application/pdf': { schema: { type: 'string', format: 'binary' } },
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { schema: { type: 'string', format: 'binary' } },
            },
          },
          responses: {
            201: { description: 'Handbook uploaded and indexed successfully', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'object', properties: { handbookId: { type: 'string' }, name: { type: 'string' }, textLength: { type: 'number' }, chunkCount: { type: 'number' }, status: { type: 'string' }, storageUrl: { type: 'string' } } } } } } } },
            400: { description: 'No file provided' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — analyst, manager, director, or admin required' },
            415: { description: 'Unsupported file type — only .pdf and .docx accepted' },
            422: { description: 'Could not extract text (possibly a scanned image PDF)' },
          },
        },
      },
      '/api/handbooks/{id}': {
        get: {
          tags: ['Handbooks'],
          summary: 'Get handbook by ID',
          description: 'Returns handbook metadata. Chunk data is excluded.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Handbook retrieved successfully' },
            401: { description: 'Unauthorized' },
            404: { description: 'Handbook not found' },
          },
        },
        delete: {
          tags: ['Handbooks'],
          summary: 'Delete a handbook',
          description: 'Permanently deletes the handbook and its indexed chunks. Existing findings retain their excerpt snapshot. Requires director or admin role.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Handbook deleted' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — director or admin required' },
            404: { description: 'Handbook not found' },
          },
        },
      },
      '/api/activity': {
        get: {
          tags: ['Activity Log'],
          summary: 'Get activity logs',
          description: 'Returns paginated activity logs. Analysts and reviewers see only their own logs. Managers and above see all company logs.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'targetType', in: 'query', schema: { type: 'string', enum: ['audit', 'flag', 'finding', 'handbook', 'position', 'payequity'] }, description: 'Filter by target type' },
            { name: 'action', in: 'query', schema: { type: 'string', enum: ['audit_created', 'audit_updated', 'audit_deleted', 'flag_decided', 'flag_assigned', 'finding_created', 'finding_updated', 'finding_status_changed', 'finding_assigned', 'handbook_uploaded', 'handbook_deleted', 'position_uploaded', 'position_reviewed', 'payequity_uploaded', 'csv_uploaded'] }, description: 'Filter by action' },
            { name: 'auditId', in: 'query', schema: { type: 'string' }, description: 'Filter by audit ID' },
            { name: 'performedBy', in: 'query', schema: { type: 'string' }, description: 'Filter by user ID — manager and above only (analysts and reviewers always see their own logs only)' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Results per page' },
          ],
          responses: {
            200: {
              description: 'Activity logs retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          logs: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                                user: { type: 'object', properties: { name: { type: 'string', example: 'Ibrahim Chhapra' }, email: { type: 'string', example: 'ibrahim@trimerge.com' }, role: { type: 'string' } } },
                                action: { type: 'string', enum: ['audit_created', 'audit_updated', 'audit_deleted', 'flag_decided', 'flag_assigned', 'finding_created', 'finding_updated', 'finding_status_changed', 'finding_assigned', 'handbook_uploaded', 'handbook_deleted', 'position_uploaded', 'position_reviewed', 'payequity_uploaded', 'csv_uploaded'] },
                                target: { type: 'object', properties: { type: { type: 'string', enum: ['audit', 'flag', 'finding', 'handbook', 'position', 'payequity'] }, audit: { type: 'object', nullable: true }, flag: { type: 'object', nullable: true }, finding: { type: 'object', nullable: true, properties: { id: { type: 'string' }, observation: { type: 'string' }, status: { type: 'string' } } }, handbook: { type: 'object', nullable: true, properties: { id: { type: 'string' }, name: { type: 'string' }, status: { type: 'string' } } } } },
                                details: { type: 'object' },
                                date: { type: 'string', format: 'date-time' },
                              },
                            },
                          },
                          pagination: { type: 'object', properties: { total: { type: 'integer', example: 42 }, page: { type: 'integer', example: 1 }, limit: { type: 'integer', example: 20 }, totalPages: { type: 'integer', example: 3 } } },
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
    customSiteTitle: 'TriMerge Comply API Docs',
    customCss: '.swagger-ui .topbar { background-color: #1a1a2e; }',
  }));
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
  console.log('[DOCS] Swagger UI at http://localhost:' + (process.env.PORT || 4000) + '/api/docs');
};

module.exports = setupSwagger;
