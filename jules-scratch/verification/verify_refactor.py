from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        # Navigate to the character creation page
        page.goto("http://localhost:5173/create-character")

        # Wait for the page to load
        page.wait_for_selector(".character-creator")

        # Fill in the character name
        page.fill('input[type="text"]', "Jules")

        # Select a class
        page.click('.class-card:first-child')

        # Click the create button
        page.click('button:text("Enter the Wasteland")')

        # Wait for the game canvas to be visible
        page.wait_for_selector(".game-canvas")

        # Take a screenshot of the play page
        page.screenshot(path="jules-scratch/verification/verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)