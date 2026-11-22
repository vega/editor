# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test-runtime/editor-cursor.test.ts >> Spec editor caret >> keeps the caret when the next keystroke follows an auto-run update immediately
- Location: tests/e2e/test-runtime/editor-cursor.test.ts:67:3

# Error details

```
Error: browserType.launch: Executable doesn't exist at /Users/yuvvan_talreja/Library/Caches/ms-playwright/firefox-1532/firefox/Nightly.app/Contents/MacOS/firefox
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     npx playwright install                                 ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```