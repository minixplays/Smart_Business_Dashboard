# Smart Business Dashboard - Engineering & UX Guidelines

## 1. Client-Side Script & HTML Generation
- **Escape HTML Within `<script>` Blocks**:
  - Never include literal `</body>`, `</html>`, `</script>`, or conditional comments (`<!--[if ...]>`) inside JavaScript string literals or template literals.
  - Always escape `<` as `\x3C` (e.g., `\x3C/body>`, `\x3C/html>`, `\x3C!--`) when generating Excel XML/HTML fallbacks, templates, or dynamic markup inside scripts. This prevents live-reload tools (like VS Code Live Server) or browser HTML tokenizers from splitting scripts and dumping raw code to the page.

## 2. Authentication, PIN & Security Fields
- **No Placeholders on Credentials**: Never provide `placeholder` text on password or PIN inputs.
- **Masked Input by Default**: Inputs capturing PINs or passwords must default to `type="password"`. Provide an eye-icon toggle button to let users preview masked text when appropriate.
- **2FA State Partitioning**:
  - *Setup*: Collect master PIN/secret.
  - *Enrollment*: Display QR code and secret key once for app scanning; verify initial 6-digit code and flag as enrolled (`*_2fa_enrolled = true`).
  - *Subsequent Relocks*: Present only the verification prompt. **Do not display the QR code again** unless the user explicitly triggers a PIN reset.
- **Typography & Layout**: Security modal/auth cards must use compact, balanced typography (`text-lg sm:text-xl` headings and `text-xs` helper text) with clean padding (`p-6 sm:p-10`).

## 3. Data Privacy in Aggregate Views
- **Exclude Protected Data**: Global aggregate streams (e.g., "All Notes") and tab counter badges must strictly exclude sensitive or protected records (such as 2FA-secured Cash Adjustments).

## 4. UI Stability & Feature Additions
- **Preserve Existing Layouts**: When adding export styling or backend processing (e.g., in `gcMaker.html`), do not alter the existing frontend table UI unless explicitly asked.
- **Flexible Search**: In lookup tools (e.g., `poMaker.html`), support flexible multi-field filtering (e.g., customer name in addition to order/PO number).

## 5. Terminal & Shell Conventions
- **Windows PowerShell Syntax**: Use `;` as the command separator rather than `&&` when chaining terminal operations.
