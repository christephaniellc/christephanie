# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Run Commands
- **Frontend**: `yarn dev` (dev server), `yarn build` (production build)
- **Backend**: `dotnet build` (build project), `dotnet lambda deploy-function` (deploy Lambda)
- **AWS Infra**: `npx cdk deploy` (deploy stack), `./scripts/deploy.sh dev` (deploy to dev environment)

## Package Management
- **IMPORTANT**: NEVER run `npm install` without explicit permission from the user
- **IMPORTANT**: NEVER use `--legacy-peer-deps` flag for any package installation commands

## Test Commands
- **Frontend**: `yarn test:unit` (all tests), `yarn test:unit -- -t "test pattern"` (single test)
- **Backend**: `dotnet test` (all tests), `dotnet test --filter "TestName"` (single test)
- **E2E Tests**: `yarn test:e2e` (all e2e tests), `yarn test:e2e:ui` (with UI)

## Lint/Format Commands
- **Frontend**: `yarn prettier:check` (format check), `yarn lint:check` (lint check), `yarn ts:check` (type check)
- **IMPORTANT**: Never run code formatters (prettier/format) - the user will always handle formatting

## Code Style Guidelines
- **Backend**: PascalCase for classes/methods, interfaces with "I" prefix, underscore for private fields
- **Frontend**: React components in PascalCase, hooks with "use" prefix, files grouped by feature
- **Error Handling**: Try-catch with specific exceptions, logging of errors with context
- **Component Structure**: Each component in own directory with index.ts export, accompanying tests
  - Maintain appropriate component depth - components should generally not exceed 200-300 lines
  - Break larger components into smaller, focused components with clear responsibilities
  - Extract business logic into custom hooks, keep components primarily focused on rendering
  - Use container/presentational pattern: containers handle logic, state and data fetching, presentational components handle UI
- **Typing**: Strong TypeScript typing for all components, enums for string constants

## Project Organization
- **Frontend**: components/, pages/, sections/, context/, utils/, hooks/
- **Backend**: Command/Query pattern, FluentValidation for validation, Autofac for DI

## Style Guidelines
- Use MUI components wherever applicable
- Use styled components per MUI's recommendations for our version of MUI
- Frontend code should be mobile-first - set base styles for mobile, then use only theme.breakpoints.up() to modify styles as screen sizes increase
- Remember best coding practices: KISS, SOLID, DRY, YAGNI

## Testing Guidelines
- Look for existing test files when updating code, create tests if none exist
- Append `[ locked]` to test titles to designate tests that should not be changed except by the user
- Add `[ wip]` to titles of new tests
- Never update `[ locked]` tests to make code pass