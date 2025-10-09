from playwright.sync_api import Page, expect

def verify_cataclysm_visualizer(page: Page):
    """
    This test verifies that the CataclysmVisualizer component renders correctly
    when a cataclysm event is triggered.
    """
    # 1. Arrange: Go to the Cataclysm Demo page.
    page.goto("http://localhost:5173/cataclysm-demo")

    # 2. Act: Find the "Start Cataclysm" button and click it.
    start_button = page.get_by_role("button", name="Start Cataclysm")
    start_button.click()

    # 3. Assert: Wait for the phase to change to "cataclysm".
    expect(page.locator("text=Phase:cataclysm")).to_be_visible(timeout=10000)

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")

if __name__ == "__main__":
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_cataclysm_visualizer(page)
            print("Verification script ran successfully.")
        except Exception as e:
            print(f"Verification script failed: {e}")
        finally:
            browser.close()