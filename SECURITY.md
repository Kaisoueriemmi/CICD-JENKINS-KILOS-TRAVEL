# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@airweight.io**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Best Practices

### For Users

1. **Use Strong Passwords**: Minimum 8 characters with uppercase, lowercase, and numbers
2. **Enable Two-Factor Authentication** (when available)
3. **Keep Your Account Secure**: Don't share credentials
4. **Review Account Activity**: Check transaction history regularly
5. **Use HTTPS**: Always access the platform via HTTPS

### For Developers

1. **Environment Variables**: Never commit `.env` files or secrets
2. **Dependencies**: Keep all dependencies up to date
3. **Input Validation**: Validate and sanitize all user inputs
4. **Authentication**: Use JWT tokens with appropriate expiration
5. **HTTPS Only**: Enforce HTTPS in production
6. **Rate Limiting**: Implement rate limiting on all endpoints
7. **SQL Injection**: Use parameterized queries (SQLAlchemy ORM)
8. **XSS Protection**: Sanitize all user-generated content
9. **CSRF Protection**: Implement CSRF tokens for state-changing operations
10. **Secrets Management**: Use environment variables or secret managers

## Security Features

### Current Implementation

- ✅ Password hashing with bcrypt
- ✅ JWT access and refresh tokens
- ✅ Token expiration and refresh mechanism
- ✅ CORS configuration
- ✅ Input validation with Pydantic
- ✅ SQL injection protection via ORM
- ✅ HTTPS ready
- ✅ Environment-based configuration

### Planned Security Enhancements

- 🔄 Two-factor authentication (2FA)
- 🔄 Rate limiting per user/IP
- 🔄 Account lockout after failed attempts
- 🔄 Email verification
- 🔄 Password reset functionality
- 🔄 Session management
- 🔄 Audit logging
- 🔄 Security headers (CSP, HSTS, etc.)
- 🔄 API key rotation
- 🔄 Penetration testing

## Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported
2. **Day 1-2**: Acknowledgment sent to reporter
3. **Day 3-7**: Vulnerability assessment and validation
4. **Day 8-30**: Patch development and testing
5. **Day 31**: Security patch released
6. **Day 38**: Public disclosure (if appropriate)

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. Users will be notified via:

- GitHub Security Advisories
- Email notifications (for registered users)
- In-app notifications
- Blog post on our website

## Bug Bounty Program

We are planning to launch a bug bounty program in the future. Stay tuned for updates!

## Contact

For security concerns, contact: **security@airweight.io**

For general inquiries: **contact@airweight.io**

---

**Security is a top priority at AirWeight. Thank you for helping us keep our platform safe! 🔒**
