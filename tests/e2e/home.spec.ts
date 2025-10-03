import { test, expect } from "@playwright/test";

test("home page loads and displays content", async ({ page }) => {
  await page.goto("/");
  
  // Check that the page loads
  await expect(page).toHaveTitle(/next-recipe-hub/);
  
  // Check for main heading
  await expect(page.getByRole("heading", { name: /next-recipe-hub/i })).toBeVisible();
  
  // Check for CTA buttons
  await expect(page.getByRole("link", { name: /get started/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /browse recipes/i })).toBeVisible();
});
