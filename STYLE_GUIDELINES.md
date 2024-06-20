# Style-Guide-AI-Checker Application Style Guide

## Code Style

1. **Components**:

- Use stand alone Angular components.
- Use only onPush Change Detection strategy.
- Common components should be stored in `src/app/common`
- metadata properties in @Component decorator should be sorted by next order:

```
 selector,
 templateUrl,
 styleUrls,
 changeDetection,
 standalone,
 imports,
```

2. **Models and DAO services**:

- Use Angular property naming convention.
- Use `src/app/shared` folder for storing Models and DAO services. Use model scope folder structure example:

```
src/app/shared/${ENTITY-NAME}/model/${ENTITY-NAME}.model.ts
src/app/shared/${ENTITY-NAME}/service/${ENTITY-NAME}-dao.service.ts
```

3. **Comments**: Code should not contain commented out code.

## Git

1. **Commit Messages**: Use the [Conventional Commits](https://www.conventionalcommits.org/) format.
2. **Strict Commit Messages**

- For self review use such commit message. example: "chore: self review"
- For resolving conflicts use such commit message. example: "chore: resolve review commits"
- For bug fixes use `fix` prefix and the ticket identifier in the scope. example: "fix(DDIAAS-8888): remove feature"

3. **Branch Naming strategy**: Use descriptive branch names. Branches should start with prefixes: feature|fix[/-]
   (example: `feature/add-login-button`, `feature-implement-dropdown-for-user-form`, , `fix/fix-login-error`).

## Pull Requests

1. **PR Description**: Provide a detailed description of the changes in the PR. Include the purpose of the PR and any relevant context.
2. **Main branch restrictions**: pull request to the 'main' branch should be raised from a branch that starts with 'feature/' or 'fix/'

## Linting

1. **Use ESLint**: All code should pass ESLint without any warnings or errors.
2. **Run Linter and Tests Before Committing**: Run the linter and fix any issues before committing your code.
