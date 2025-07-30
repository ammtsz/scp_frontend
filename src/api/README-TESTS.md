# API Testing Documentation

## Overview

This document describes the comprehensive unit test suite created for the MVP Center frontend API layer. The test suite covers all API endpoints and utility functions with comprehensive test scenarios.

## Test Coverage

- **Statements:** 91.26%
- **Branches:** 88.23%
- **Functions:** 94.11%
- **Lines:** 90.45%

## Test Structure

### API Modules Tested

1. **Patients API** (`src/api/patients/index.test.ts`)

   - CRUD operations (Create, Read, Update, Delete)
   - Error handling for various HTTP status codes
   - TypeScript type safety validation

2. **Attendances API** (`src/api/attendances/index.test.ts`)

   - Full CRUD operations
   - Convenience methods for status updates:
     - Check-in attendance
     - Start attendance
     - Complete attendance
     - Cancel attendance
   - Date/time handling for status transitions

3. **Treatment Records API** (`src/api/treatment-records/index.test.ts`)

   - CRUD operations
   - Lookup by attendance ID
   - Validation for treatment parameters

4. **Schedule Settings API** (`src/api/schedule-settings/index.test.ts`)

   - CRUD operations
   - Active schedule filtering
   - Day of week and time validation

5. **Utility Functions** (`src/api/utils/functions.test.ts`)

   - Error message handling
   - HTTP status code mapping

6. **Axios Configuration** (`src/api/lib/axios.test.ts`)

   - Base URL configuration
   - Headers and timeout settings
   - Credentials handling

7. **Module Exports** (`src/api/index.test.ts`)
   - Validation that all modules are properly exported
   - Import/export integrity checks

## Test Features

### Mocking Strategy

- Uses Jest mocking for Axios HTTP client
- Isolates API functions from actual HTTP calls
- Consistent mock configuration across test files

### Error Handling

- Tests error scenarios for all endpoints
- Validates error message formatting
- Covers HTTP status codes (400, 401, 404, 500, etc.)

### Type Safety

- Uses TypeScript interfaces throughout tests
- Validates request/response data structures
- Ensures enum usage is correct

### Convenience Methods

- Tests specialized attendance status update methods
- Validates date/time stamp generation
- Ensures proper data transformation

## Test Commands

```bash
# Run all API tests with coverage
npm test -- src/api --coverage

# Run specific test files
npm test -- src/api/patients/index.test.ts
npm test -- src/api/attendances/index.test.ts
npm test -- src/api/treatment-records/index.test.ts
npm test -- src/api/schedule-settings/index.test.ts

# Run utility tests
npm test -- src/api/utils/functions.test.ts
npm test -- src/api/lib/axios.test.ts
```

## Configuration

### Jest Setup

- TypeScript support via ts-jest
- JSX environment for React components (excluded from coverage)
- Module path mapping for @/ imports
- Mock configuration in jest.setup.ts

### Coverage Collection

- Focused on API directory only
- Excludes test files from coverage
- Excludes TypeScript declaration files

## Test Scenarios Covered

### Success Scenarios

- ✅ Successful data retrieval
- ✅ Successful data creation
- ✅ Successful data updates
- ✅ Successful data deletion
- ✅ Convenience method operations

### Error Scenarios

- ✅ Network errors (500, 502, 503)
- ✅ Not found errors (404)
- ✅ Validation errors (400)
- ✅ Unauthorized errors (401)
- ✅ Generic error handling

### Data Validation

- ✅ Request data structure validation
- ✅ Response data structure validation
- ✅ TypeScript enum usage
- ✅ Optional parameter handling
- ✅ Required parameter validation

## Benefits

1. **Quality Assurance**: Comprehensive test coverage ensures API functions work correctly
2. **Regression Prevention**: Tests catch breaking changes during development
3. **Documentation**: Tests serve as living documentation of API behavior
4. **Type Safety**: TypeScript integration ensures type correctness
5. **Maintainability**: Well-structured tests make future changes safer

## Future Enhancements

1. **Integration Tests**: Add tests that call actual backend endpoints
2. **Performance Tests**: Add timing and load testing for API calls
3. **Mock Server**: Implement a mock server for more realistic testing
4. **E2E Tests**: Add end-to-end tests using testing frameworks like Cypress
5. **API Contract Testing**: Add tests to validate API contract compliance

## Dependencies

- **Jest**: Testing framework
- **ts-jest**: TypeScript support for Jest
- **@types/jest**: TypeScript type definitions
- **jest-environment-jsdom**: DOM environment for React components
- **@testing-library/jest-dom**: Additional Jest matchers

This test suite provides a solid foundation for maintaining the quality and reliability of the frontend API layer as the project grows and evolves.
