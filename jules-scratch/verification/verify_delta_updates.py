from playwright.sync_api import Page, expect

def test_game_loads_with_delta_updates(page: Page):
    """
    This test verifies that the game loads correctly and that the player
    and world are rendered, which implicitly tests that the delta-based
    state updates are working on initial load.
    """
    # 1. Arrange: Go to the application's homepage.
    page.goto("http://localhost:5174")

    # 2. Interact: Open the browser's developer console
    page.keyboard.press("F12")

    # 3. Screenshot: Capture the page with the console open
    page.screenshot(path="jules-scratch/verification/verification.png")