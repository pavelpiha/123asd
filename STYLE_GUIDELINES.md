# 123ASD Application Style Guide

## Code Style

1. **Components**:
 - Use stand alone Angular components.
 - Use only onPush CD strategy.
 - Common components should be stored in `src/app/common`
2. **Models and DAO services**:
 - Use Angular property naming convention.
 - Use `src/app/shared` folder for storing Models and DAO services. Use model scope folder structure example:
```
src/app/shared/${ENTITY-NAME}/model/${ENTITY-NAME}.model.ts
src/app/shared/${ENTITY-NAME}/service/${ENTITY-NAME}-dao.service.ts
```

## Git

1. **Commit Messages**: Use the [Conventional Commits](https://www.conventionalcommits.org/) format.
2. **Strict Commit Messages**
  - For self review use such commit message: "chore: self review"
  - For resolving conflicts use such commit message: "chore: resolve review commits"
  - For bug fixes always add the ticket identifier in the scope: "fix(DDIAAS-8888): remove feature"
3. **Branch Naming strategy**: Use descriptive branch names prefixed with the type of tasks. allowed branches prefixes are from such regexp: feature|fix[/-]
(for example: `feature/add-login-button`, `feature-implement-dropdown-for-user-form`, , `fix/fix-login-error`).

## Pull Requests

1. **PR Description**: Provide a detailed description of the changes in the PR. Include the purpose of the PR and any relevant context.
2. **Main branch restrictions**: It is allowed to raise Pull Requests only from `feature` and `fix` branches to the `main` branch


## Linting

1. **Use ESLint**: All code should pass ESLint without any warnings or errors.
2. **Run Linter and Tests Before Committing**: Run the linter and fix any issues before committing your code.

Please follow these guidelines to maintain the quality and readability of our codebase.
