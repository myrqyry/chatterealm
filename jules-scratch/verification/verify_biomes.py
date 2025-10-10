from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:5174/")

        # Wait for the main canvas to be visible
        canvas_locator = page.locator('canvas')
        expect(canvas_locator).to_be_visible(timeout=30000)

        # Give the animations and textures some time to render
        page.wait_for_timeout(5000)

        page.screenshot(path="jules-scratch/verification/biomes.png")
        print("Screenshot taken successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)