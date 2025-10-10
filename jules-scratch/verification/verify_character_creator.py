import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_character_creator(page: Page):
    """
    This script verifies the character creation screen by navigating to it,
    interacting with the form, and taking a screenshot.
    It also captures console logs for debugging.
    """
    # Listen for all console events and print them
    page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.type}: {msg.text}"))

    # 1. Navigate to the character creation page.
    # The dev server is running on localhost:5173 and the page is at /create-character.
    page.goto("http://localhost:5173/create-character")

    # 2. Assert that the main heading is visible.
    heading = page.get_by_role("heading", name="Create Your Survivor")
    expect(heading).to_be_visible(timeout=10000) # Increased timeout for initial load

    # 3. Select a character class. We'll choose 'Tech Shaman'.
    class_card = page.get_by_text("Tech Shaman")
    expect(class_card).to_be_visible()
    class_card.click()

    # 4. Assert that the class selection is reflected in the preview section.
    stats_heading = page.get_by_role("heading", name="Tech Shaman")
    expect(stats_heading).to_be_visible()

    # 5. Enter a character name.
    name_input = page.get_by_placeholder("Enter your wasteland name...")
    expect(name_input).to_be_visible()
    name_input.fill("Jules the Shaman")

    # 6. Wait for the character preview animation to appear.
    # The preview is rendered inside a div with the class 'character-preview-avatar'.
    preview_avatar = page.locator(".character-preview-avatar")
    expect(preview_avatar).to_be_visible()

    # Wait for an SVG to be rendered inside the preview.
    # This confirms the EmojiCharacterService has run successfully.
    expect(preview_avatar.locator("svg")).to_be_visible(timeout=5000)

    # 7. Take a screenshot of the complete UI.
    page.screenshot(path="jules-scratch/verification/character_creator_verification.png")
    print("Screenshot saved to jules-scratch/verification/character_creator_verification.png")

# Boilerplate to run the verification
if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_character_creator(page)
        finally:
            browser.close()