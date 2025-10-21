/* ============================================================================
REQUIREMENT TRACEABILITY
============================================================================
Requirement ID: REQ-LOGIN-449-1406
User Story: Validate login inputs and log audit metadata on submit (no network).
Acceptance Criteria:
- Email format validation for username
- Required password validation
- Error messages in dedicated placeholders
- Console-based audit logs (timestamp, action type, user id if present)
GxP Impact: YES (Audit trail hooks, validation)
Risk Level: LOW
Validation Protocol: VP-UI-LOGIN-001
============================================================================
RELEASE CHECKLIST
- [x] Input validation with user-friendly messages
- [x] Audit log (console) including timestamp & action type
- [x] No external network calls
- [x] Accessible alerts via aria-live regions
============================================================================ */

/**
 * PUBLIC_INTERFACE
 * validateEmail
 * Simple email format validation according to common patterns.
 * Returns boolean indicating validity.
 * GxP Critical: No (UI helper), supports critical validation flow.
 * @param {string} value - email candidate
 * @returns {boolean}
 */
function validateEmail(value) {
  // Very basic email regex for UI-side validation
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(value).toLowerCase());
}

/**
 * PUBLIC_INTERFACE
 * buildAuditRecord
 * Build an audit-like record for console logging (no persistence).
 * GxP Critical: Yes (Audit trail hook placeholder)
 * @param {object} params - audit metadata
 * @returns {object} audit record
 */
function buildAuditRecord(params = {}) {
  const {
    action = "READ",
    userId = "anonymous",
    context = "login_form_submit",
    before = null,
    after = null,
    reason = null
  } = params;

  return {
    ts: new Date().toISOString(),
    action,
    userId,
    context,
    before,
    after,
    reason,
    source: "ui",
    screen: "Login (449:1406)"
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const remember = document.getElementById("remember");

  const usernameError = document.getElementById("username-error");
  const passwordError = document.getElementById("password-error");
  const formErrors = document.getElementById("form-errors");

  /**
   * PUBLIC_INTERFACE
   * clearErrors
   * Clear field and form level error messages.
   * GxP Critical: No (UI helper)
   */
  function clearErrors() {
    [usernameError, passwordError, formErrors].forEach((el) => {
      if (el) el.textContent = "";
    });
    username.setAttribute("aria-invalid", "false");
    password.setAttribute("aria-invalid", "false");
  }

  /**
   * PUBLIC_INTERFACE
   * showFieldError
   * Display an error for a specific field and mark aria-invalid.
   * GxP Critical: No (UI helper)
   * @param {HTMLElement} fieldInput
   * @param {HTMLElement} fieldError
   * @param {string} message
   */
  function showFieldError(fieldInput, fieldError, message) {
    fieldInput.setAttribute("aria-invalid", "true");
    if (fieldError) fieldError.textContent = message;
  }

  /**
   * PUBLIC_INTERFACE
   * handleSubmit
   * Validate inputs; if valid, log audit-like metadata; prevent network calls.
   * GxP Critical: Yes (validation + audit logging)
   * @param {Event} e
   */
  function handleSubmit(e) {
    e.preventDefault();
    clearErrors();

    const emailVal = (username.value || "").trim();
    const pwdVal = (password.value || "").trim();

    let hasError = false;

    if (!emailVal) {
      showFieldError(username, usernameError, "Email is required.");
      hasError = true;
    } else if (!validateEmail(emailVal)) {
      showFieldError(username, usernameError, "Please enter a valid email address.");
      hasError = true;
    }

    if (!pwdVal) {
      showFieldError(password, passwordError, "Password is required.");
      hasError = true;
    }

    if (hasError) {
      if (formErrors) formErrors.textContent = "Please correct the highlighted fields.";
      // Audit: validation failure
      const auditFail = buildAuditRecord({
        action: "VALIDATION_FAIL",
        userId: emailVal || "anonymous",
        context: "login_form_submit",
        reason: "client_validation_error",
        before: null,
        after: null
      });
      console.info("[AUDIT]", auditFail);
      return;
    }

    // No-op successful submit behavior
    // Audit trail logging (no persistence)
    const audit = buildAuditRecord({
      action: "READ", // UI submit attempt; not modifying data
      userId: emailVal || "anonymous",
      context: "login_form_submit",
      before: null,
      after: {
        remember: !!remember?.checked
      },
      reason: null
    });
    console.info("[AUDIT]", audit);

    // UX note: In real integration, dispatch an event or call API.
    // Here, we only log success.
    if (formErrors) formErrors.textContent = "Form looks good. Submission is a no-op in this demo.";
  }

  form.addEventListener("submit", handleSubmit);

  // Also handle the explicit button click defensively
  const submitBtn = document.getElementById("login-submit");
  submitBtn?.addEventListener("click", (e) => {
    // Let the form submit handler control flow
  });
});
