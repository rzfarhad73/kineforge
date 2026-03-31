import { expect, test } from '@playwright/test'

const TEST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10"/>
  <path d="M12 8v8"/>
</svg>`

test.describe('Kineforge E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('paste SVG and verify it appears on canvas and layers', async ({ page }) => {
    // Fill the paste textarea with SVG markup
    const textarea = page.getByPlaceholder('<svg>...</svg>')
    await textarea.fill(TEST_SVG)
    await page.getByRole('button', { name: 'Add SVG' }).click()

    // Verify SVG elements render on the canvas
    await expect(page.locator('[data-svg-id]').first()).toBeVisible()

    // Verify layers panel shows the root element
    await expect(page.getByRole('treeitem').first()).toBeVisible()
  })

  test('select element in layers and verify properties panel', async ({ page }) => {
    // Load sample SVG
    await page.getByRole('button', { name: 'Load sample' }).click()

    // Click a child element in the layer tree (skip root svg, click first child)
    const treeItems = page.getByRole('treeitem')
    await expect(treeItems.first()).toBeVisible()

    // Click the second treeitem (first child element after root)
    const childItem = treeItems.nth(1)
    await childItem.click()

    // Verify the properties panel shows content (not the empty state)
    const propertiesSidebar = page.locator('aside[aria-label="Properties"]')
    await expect(propertiesSidebar).toBeVisible()
    // Should not show the "Select an element" empty state
    await expect(
      propertiesSidebar.getByText('Select an element on the canvas'),
    ).not.toBeVisible()
  })

  test('apply rotation and play animation', async ({ page }) => {
    // Load sample and select an element
    await page.getByRole('button', { name: 'Load sample' }).click()
    const treeItems = page.getByRole('treeitem')
    await treeItems.nth(1).click()

    // Find the Rotate row by its label text, then locate the numeric input within it
    const rotateRow = page.locator('div').filter({ hasText: /^Rotate$/ }).first()
    // The SliderInput has a visible numeric input — fill the text input next to the slider
    const rotateInput = rotateRow.locator('..').locator('input[type="text"]').first()
    await rotateInput.fill('180')
    await rotateInput.press('Enter')

    // Click Play button
    await page.getByRole('button', { name: 'Play' }).click()

    // Verify the button now shows "Stop"
    await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible()

    // Click Stop
    await page.getByRole('button', { name: 'Stop' }).click()
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
  })

  test('export SVG triggers download', async ({ page }) => {
    // Load sample SVG
    await page.getByRole('button', { name: 'Load sample' }).click()

    // Select the SVG root (first treeitem)
    const treeItems = page.getByRole('treeitem')
    await treeItems.first().click()

    // Click Export SVG and intercept the download
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export SVG' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.svg$/)
  })

  test('copy React code shows copied confirmation', async ({ page }) => {
    // Load sample SVG
    await page.getByRole('button', { name: 'Load sample' }).click()

    // Select the SVG root
    const treeItems = page.getByRole('treeitem')
    await treeItems.first().click()

    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-write', 'clipboard-read'])

    // Click React Code button
    await page.getByRole('button', { name: 'React Code' }).click()

    // Verify "Copied!" confirmation appears
    await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible()
  })

  test('delete element removes it from layers', async ({ page }) => {
    // Load sample SVG
    await page.getByRole('button', { name: 'Load sample' }).click()

    const treeItems = page.getByRole('treeitem')
    const initialCount = await treeItems.count()
    expect(initialCount).toBeGreaterThan(1)

    // Select a child element (not the root)
    await treeItems.nth(1).click()

    // Press Delete
    await page.keyboard.press('Delete')

    // Verify one fewer element in the tree
    await expect(treeItems).toHaveCount(initialCount - 1)
  })
})
