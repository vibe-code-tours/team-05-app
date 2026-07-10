# Release Workflow

## Overview
Complete workflow for releasing a new version to production.

---

## Flow

```
Release Decision
  ↓
1. Release Planning
  ↓
2. Pre-Release Testing
  ↓
3. Documentation Update
  ↓
4. Version Bump
  ↓
5. Deployment
  ↓
6. Post-Release Verification
  ↓
7. Monitoring
```

---

## Step 1: Release Planning
**Agent:** product-owner

- [ ] Define release scope
- [ ] List included features/fixes
- [ ] Identify risks
- [ ] Set timeline
- [ ] Notify team

**Output:** Release plan

---

## Step 2: Pre-Release Testing
**Agent:** qa

- [ ] Full regression testing
- [ ] Performance testing
- [ ] Security testing
- [ ] UAT sign-off
- [ ] Load testing

**Output:** Test report

---

## Step 3: Documentation Update
**Agent:** documentation

- [ ] Update changelog
- [ ] Update API docs
- [ ] Update README
- [ ] Notify stakeholders

**Output:** Updated documentation

---

## Step 4: Version Bump
**Agent:** devops

- [ ] Update package.json version
- [ ] Create git tag
- [ ] Update CHANGELOG.md
- [ ] Commit changes

**Output:** Version tagged

---

## Step 5: Deployment
**Agent:** devops

- [ ] Deploy to staging
- [ ] Verify staging
- [ ] Deploy to production
- [ ] Verify production
- [ ] Update DNS if needed

**Output:** Production deployed

---

## Step 6: Post-Release Verification
**Agent:** qa

- [ ] Smoke test critical flows
- [ ] Verify monitoring
- [ ] Check error rates
- [ ] Confirm performance

**Output:** Verification report

---

## Step 7: Monitoring
**Agent:** devops

- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Monitor user feedback
- [ ] Ready to rollback if needed

**Output:** Stable release
