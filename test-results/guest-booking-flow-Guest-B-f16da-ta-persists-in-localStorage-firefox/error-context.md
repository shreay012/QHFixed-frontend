# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: guest-booking-flow.spec.js >> Guest Booking Flow - Complete Journey >> Guest Booking Steps Validation >> GBF-003: Guest booking data persists in localStorage
- Location: tests/e2e/guest-booking-flow.spec.js:56:9

# Error details

```
Error: Channel closed
```

```
Error: browserContext.close: Test ended.
Browser logs:

<launching> /Users/orange/Library/Caches/ms-playwright/firefox-1511/firefox/Nightly.app/Contents/MacOS/firefox -no-remote -headless -profile /var/folders/4p/3p96gd896rxf_qrgqktthbp00000gp/T/playwright_firefoxdev_profile-FjuM2Y -juggler-pipe -silent
<launched> pid=10248
[pid=10248][err] *** You are running in headless mode.
[pid=10248][err] JavaScript warning: resource://services-settings/Utils.sys.mjs, line 116: unreachable code after return statement
[pid=10248][out] console.warn: services.settings: Ignoring preference override of remote settings server
[pid=10248][out] console.warn: services.settings: Allow by setting MOZ_REMOTE_SETTINGS_DEVTOOLS=1 in the environment
[pid=10248][out] 
[pid=10248][out] Juggler listening to the pipe
[pid=10248] <gracefully close start>
[pid=10248] <forcefully close>
[pid=10248] <kill>
[pid=10248] <will force kill>
```