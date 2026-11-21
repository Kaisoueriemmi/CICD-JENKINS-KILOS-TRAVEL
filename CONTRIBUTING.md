# Contributing to AirWeight

First off, thank you for considering contributing to AirWeight! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, browser, versions)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would be used**

### Pull Requests

- Fill in the required template
- Follow the coding style guidelines
- Include appropriate test coverage
- Update documentation as needed
- End all files with a newline

## Development Process

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** if you've added code that should be tested
4. **Ensure the test suite passes**
5. **Make sure your code lints**
6. **Issue the pull request**

## Coding Standards

### Python (Backend)

- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions and classes
- Maximum line length: 100 characters
- Use Black for code formatting
- Use Flake8 for linting
- Use mypy for type checking

```python
# Good example
def calculate_credit_value(flight_type: FlightType, difference_kg: float) -> float:
    """
    Calculate credit value based on flight type and weight difference.

    Args:
        flight_type: Type of flight (domestic, international, transatlantic)
        difference_kg: Weight difference in kilograms

    Returns:
        Credit value after applying multiplier
    """
    if difference_kg <= 0:
        return 0.0
    # ... rest of implementation
```

### TypeScript/React (Frontend)

- Use TypeScript for all new files
- Follow Airbnb React/JSX Style Guide
- Use functional components with hooks
- Use meaningful component and variable names
- Maximum line length: 100 characters
- Use ESLint and Prettier

```typescript
// Good example
interface WalletProps {
  balance: number;
  onDebit: (amount: number) => void;
}

export const WalletCard: React.FC<WalletProps> = ({ balance, onDebit }) => {
  // Component implementation
};
```

## Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Consider using emoji prefixes:
  - 🚀 `:rocket:` - New features
  - 🐛 `:bug:` - Bug fixes
  - 📚 `:books:` - Documentation
  - 🎨 `:art:` - UI/UX improvements
  - ♻️ `:recycle:` - Refactoring
  - ✅ `:white_check_mark:` - Tests
  - 🔒 `:lock:` - Security fixes

Example:

```
🚀 Add OCR ticket scanning feature

- Integrate Google Vision API
- Add image upload endpoint
- Create ticket parsing service
- Update wallet crediting logic

Closes #123
```

## Testing

### Backend Tests

```bash
cd backend
pytest
pytest --cov=app tests/
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

## Documentation

- Update README.md if needed
- Update API documentation
- Add JSDoc/docstrings for new functions
- Update CHANGELOG.md

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to AirWeight! ✈️**
