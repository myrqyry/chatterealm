from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:5173/create-character", timeout=60000)

    # Wait for the page to load
    page.wait_for_load_state("networkidle", timeout=60000)

    print(page.content())

    # Enter a character name
    page.get_by_placeholder("Enter your character name").fill("Test Player")

    # Enter a complex emoji
    emoji_input = page.get_by_placeholder("Type emoji here...")
    complex_emoji = '👮🏾‍♂️'
    emoji_input.fill(complex_emoji)

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)