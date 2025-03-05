# CLAUDE.md - Development Guide

## Build/Run Commands
- **Frontend**: `yarn dev` (dev server), `yarn build` (production build)
- **Backend**: `dotnet build` (build project), `dotnet lambda deploy-function` (deploy Lambda)
- **AWS Infra**: `npx cdk deploy` (deploy stack), `./scripts/deploy.sh dev` (deploy to dev environment)

## Test Commands
- **Frontend**: `yarn test:unit` (all tests), `yarn test:unit -- -t "test pattern"` (single test)
- **Backend**: `dotnet test` (all tests), `dotnet test --filter "TestName"` (single test)
- **E2E Tests**: `yarn test:e2e` (all e2e tests), `yarn test:e2e:ui` (with UI)

## Lint/Format Commands
- **Frontend**: `yarn prettier:check` (format check), `yarn lint:check` (lint check), `yarn ts:check` (type check)

## Code Style Guidelines
- **Backend**: PascalCase for classes/methods, interfaces with "I" prefix, underscore for private fields
- **Frontend**: React components in PascalCase, hooks with "use" prefix, files grouped by feature
- **Error Handling**: Try-catch with specific exceptions, logging of errors with context
- **Component Structure**: Each component in own directory with index.ts export, accompanying tests
- **Typing**: Strong TypeScript typing for all components, enums for string constants

## Project Organization
- **Frontend**: components/, pages/, sections/, context/, utils/, hooks/
- **Backend**: Command/Query pattern, FluentValidation for validation, Autofac for DI