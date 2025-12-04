# Swagger Implementation Guide

This document explains how Swagger/OpenAPI documentation has been implemented in this NestJS project.

## What is Swagger?

Swagger (OpenAPI) is an API documentation tool that automatically generates interactive API documentation. It allows you to:

- View all available endpoints
- Test APIs directly from the browser
- See request/response schemas
- Understand authentication requirements

## Installation

The following packages were installed:

```bash
npm install --save @nestjs/swagger swagger-ui-express
```

## Configuration

### 1. Main Configuration (`src/main.ts`)

Swagger is configured in the `main.ts` file:

```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Swagger Configuration
const config = new DocumentBuilder()
  .setTitle('Project Stark API')
  .setDescription('NestJS Authentication API with JWT')
  .setVersion('1.0')
  .addTag('auth', 'Authentication endpoints')
  .addTag('users', 'User management endpoints')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

**Key Points:**

- `setTitle()` - Sets the API title
- `setDescription()` - Adds API description
- `addTag()` - Groups endpoints by tags
- `addBearerAuth()` - Adds JWT authentication support
- `SwaggerModule.setup('api', ...)` - Makes Swagger UI available at `/api`

### 2. Controller Decorators

#### Auth Controller (`src/auth/auth.controller.ts`)

```typescript
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth') // Groups all endpoints under 'auth' tag
@Controller('auth')
export class AuthController {
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    // ...
  }
}
```

#### Users Controller (`src/users/users.controller.ts`)

```typescript
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth('JWT-auth') // Indicates JWT authentication required
@Controller('users')
export class UsersController {
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns all users' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @Get()
  async findAll(@GetUser() user) {
    // ...
  }
}
```

**Decorator Explanation:**

- `@ApiTags()` - Groups endpoints by category
- `@ApiBearerAuth('JWT-auth')` - Marks controller as requiring JWT authentication
- `@ApiOperation()` - Describes what the endpoint does
- `@ApiResponse()` - Documents possible responses

### 3. DTO Decorators

DTOs use `@ApiProperty()` to document request/response schemas:

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;
}
```

## Accessing Swagger UI

Once the server is running, access Swagger at:

```
http://localhost:3000/api
```

## Using Swagger UI

### 1. Testing Public Endpoints

Public endpoints (like `/auth/signup` and `/auth/signin`) can be tested directly:

1. Click on the endpoint
2. Click "Try it out"
3. Fill in the request body
4. Click "Execute"

### 2. Testing Protected Endpoints

Protected endpoints require JWT authentication:

1. **Get a token:**
   - Use `/auth/signin` endpoint
   - Copy the `accessToken` from the response

2. **Authorize:**
   - Click the "Authorize" button (🔒) at the top
   - Enter: `Bearer <your-access-token>`
   - Click "Authorize"

3. **Test endpoints:**
   - Now you can test protected endpoints like `/users/profile`

## Benefits

✅ **Auto-generated documentation** - No need to manually write API docs
✅ **Interactive testing** - Test APIs directly from browser
✅ **Type safety** - DTOs ensure request/response schemas are accurate
✅ **Authentication support** - Easy JWT token management
✅ **Always up-to-date** - Documentation updates with code changes

## Common Decorators Reference

| Decorator          | Purpose                 | Example                                                 |
| ------------------ | ----------------------- | ------------------------------------------------------- |
| `@ApiTags()`       | Group endpoints         | `@ApiTags('users')`                                     |
| `@ApiOperation()`  | Describe endpoint       | `@ApiOperation({ summary: 'Get user' })`                |
| `@ApiResponse()`   | Document responses      | `@ApiResponse({ status: 200, description: 'Success' })` |
| `@ApiProperty()`   | Document DTO properties | `@ApiProperty({ example: 'John' })`                     |
| `@ApiBearerAuth()` | Require JWT auth        | `@ApiBearerAuth('JWT-auth')`                            |

## Troubleshooting

**Issue:** Swagger UI not loading

- **Solution:** Ensure server is running and visit `http://localhost:3000/api`

**Issue:** Protected endpoints return 401

- **Solution:** Click "Authorize" and enter valid JWT token

**Issue:** Request schema not showing

- **Solution:** Ensure DTOs have `@ApiProperty()` decorators
