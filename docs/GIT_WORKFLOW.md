# 🌿 Git Workflow & Branching Strategy

## Branch Structure

### Main Branches
- **`main`** - Production-ready code, always stable
- **`develop`** - Integration branch for features, staging environment

### Feature Branches
- **`feature/task-name`** - New features and enhancements
- **`bugfix/issue-description`** - Bug fixes
- **`hotfix/critical-fix`** - Critical production fixes
- **`accessibility/improvement`** - Accessibility-specific improvements

## Workflow Rules

### 1. Feature Development
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/setup-senior-app

# Work on feature
git add .
git commit -m "feat: implement main screen layout"

# Push and create PR
git push origin feature/setup-senior-app
# Create PR: feature/setup-senior-app → develop
```

### 2. Bug Fixes
```bash
# Start bug fix
git checkout develop
git pull origin develop
git checkout -b bugfix/sos-button-not-working

# Fix bug
git add .
git commit -m "fix: resolve SOS button functionality"

# Push and create PR
git push origin bugfix/sos-button-not-working
# Create PR: bugfix/sos-button-not-working → develop
```

### 3. Hotfixes (Critical Production Issues)
```bash
# Start hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# Fix issue
git add .
git commit -m "hotfix: fix critical security vulnerability"

# Push and create PRs
git push origin hotfix/critical-security-fix
# Create PR: hotfix/critical-security-fix → main
# Create PR: hotfix/critical-security-fix → develop
```

## Commit Message Convention

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **accessibility**: Accessibility improvements
- **ui**: UI/UX changes

### Examples
```bash
git commit -m "feat(senior-app): implement one-touch calling functionality"
git commit -m "fix(backend): resolve photo upload timeout issue"
git commit -m "accessibility(ui): add high-contrast mode support"
git commit -m "docs(readme): update installation instructions"
```

## Branch Protection Rules

### Main Branch (`main`)
- ✅ Require pull request reviews (2 reviewers)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Restrict pushes to main branch
- ✅ Require linear history

### Develop Branch (`develop`)
- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date

## Tagging Strategy

### Version Tags
```bash
# Major releases (Phase milestones)
git tag -a v1.0.0 -m "Phase 1 MVP Release"
git tag -a v2.0.0 -m "Phase 2 Accessibility Release"

# Minor releases (feature additions)
git tag -a v1.1.0 -m "Add photo sharing improvements"

# Patch releases (bug fixes)
git tag -a v1.0.1 -m "Fix SOS button responsiveness"
```

### Release Process
```bash
# Create release branch
git checkout main
git pull origin main
git checkout -b release/v1.0.0

# Update version numbers
# Update CHANGELOG.md
git add .
git commit -m "chore: prepare release v1.0.0"

# Merge to main and tag
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge main
git push origin develop
```

## GitHub Features Integration

### 1. Issues
- Use issue templates for bugs and features
- Link issues to PRs with `Closes #123`
- Use labels: `bug`, `enhancement`, `accessibility`, `priority-high`, etc.

### 2. Projects
- **Phase 1 MVP Board**: Track all Phase 1 tasks
- **Accessibility Board**: Focus on accessibility improvements
- **Bug Tracking Board**: Monitor and prioritize bugs

### 3. Milestones
- **Phase 1 MVP**: All core features
- **Phase 2 Accessibility**: Enhanced accessibility features
- **Phase 3 Family Features**: Advanced family connection features

### 4. Pull Request Templates
- Use accessibility checklist
- Include testing information
- Link to related issues

## Code Review Guidelines

### For Reviewers
1. **Accessibility First**: Check WCAG 2.2 compliance
2. **Senior-Friendly**: Ensure large text, high contrast, simple UI
3. **Security**: Review for data privacy and encryption
4. **Performance**: Check for mobile optimization
5. **Testing**: Verify test coverage

### For Authors
1. **Small PRs**: Keep changes focused and reviewable
2. **Clear Descriptions**: Explain what and why
3. **Test Coverage**: Include tests for new features
4. **Documentation**: Update docs if needed
5. **Accessibility**: Test with screen readers and high contrast

## Emergency Procedures

### Critical Bug in Production
```bash
# Create hotfix from main
git checkout main
git checkout -b hotfix/critical-issue

# Fix and test
git add .
git commit -m "hotfix: fix critical production issue"

# Deploy immediately
git push origin hotfix/critical-issue
# Create PR and merge immediately after review
```

### Rollback Procedure
```bash
# Identify last good commit
git log --oneline

# Create rollback branch
git checkout main
git checkout -b rollback/to-stable-version

# Revert to stable commit
git revert <commit-hash>
git push origin rollback/to-stable-version
# Create PR and merge
```

## Best Practices

1. **Always pull before starting work**
2. **Keep commits atomic and focused**
3. **Write descriptive commit messages**
4. **Test before pushing**
5. **Use meaningful branch names**
6. **Delete merged branches**
7. **Keep main branch stable**
8. **Regularly sync with develop**

---

*This workflow is designed to ensure code quality, accessibility compliance, and smooth collaboration for the FamilyBridge project.*
