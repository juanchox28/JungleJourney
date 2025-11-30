import { test, expect } from '@playwright/test';

test.describe('Hotel Booking Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/hotel-booking');
    });

    test('should display booking page correctly', async ({ page }) => {
        // The document title is "Ayahuasca Puerto Narino Official Site..."
        await expect(page).toHaveTitle(/Ayahuasca Puerto Narino/);
        await expect(page.getByText('Fecha de Entrada')).toBeVisible();
        await expect(page.getByText('Fecha de Salida')).toBeVisible();
    });

    test('should allow a standard booking flow', async ({ page }) => {
        // Mock the API response to avoid backend dependencies and external redirects
        await page.route('**/api/create-accommodation-booking', async route => {
            const json = {
                ok: true,
                success_url: '/booking-success.html',
                booking: { reference: 'TEST-REF' }
            };
            await route.fulfill({ json });
        });

        // Listen for alerts to debug errors
        page.on('dialog', async dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            // Fail the test if an error alert appears
            if (dialog.message().includes('Error')) {
                throw new Error(`Booking failed with alert: ${dialog.message()}`);
            }
            await dialog.dismiss();
        });

        // 1. Select Guests (default is 1)
        // We'll stick to 1 guest to avoid capacity issues with small rooms.
        // await page.locator('button:has(.lucide-plus)').first().click();
        // await expect(page.locator('.flex-1.text-center.font-medium.text-gray-900')).toHaveText('2');

        // 2. Select Dates
        // We need to pick dates. Since the date picker might be tricky with native inputs,
        // we'll set the values directly or use keyboard interaction if possible.
        // Let's try setting values directly for stability.

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(today.getDate() + 2);

        const checkIn = tomorrow.toISOString().split('T')[0];
        const checkOut = dayAfterTomorrow.toISOString().split('T')[0];

        await page.fill('input[type="date"][id="checkin"]', checkIn);
        await page.fill('input[type="date"][id="checkout"]', checkOut);

        // 3. Check Availability
        // The form automatically submits/hides when dates are valid in the current implementation.
        // So we don't click the button, but we wait for the rooms section.
        // await page.click('button:has-text("Verificar Disponibilidad")');

        // 4. Select a Room
        // Wait for rooms to appear
        await expect(page.locator('#rooms-section')).toBeVisible();

        // Find the first room card and click '+'
        // The room button has TEXT "+", unlike the guest button which has an icon.
        // We scope it to #rooms-section to avoid finding other buttons.
        const firstRoomPlusBtn = page.locator('#rooms-section button:has-text("+")').first();
        await firstRoomPlusBtn.click();

        // 5. Verify Booking Form Appears
        await expect(page.locator('#booking-form')).toBeVisible();

        // 6. Fill Guest Details
        await page.fill('#guest-name', 'Test Automation User');
        await page.fill('#guest-email', 'test.automation@example.com');
        await page.fill('#special-requests', 'Late check-in please');

        // 7. Select Payment Method (Cash if available, otherwise Card)
        // Default is 'cash', so we don't need to click it.
        // await page.click('label[for="cash-payment"]');

        // 8. Submit
        // Handle potential alert/redirect
        // The app does: window.location.href = ...
        // We can wait for URL change.
        await page.click('button:has-text("Confirmar Reserva")');

        // 9. Verify Success
        await expect(page).toHaveURL(/booking-success/);
        await expect(page.getByText('Test Automation User')).toBeVisible();
        // The success page doesn't show payment method, but shows reference
        await expect(page.getByText('TEST-REF')).toBeVisible();
    });

    test.skip('should validate dates', async ({ page }) => {
        // Try to submit without dates
        // The browser validation might stop it, or the alert.
        // The code uses `required` attribute, so browser validation kicks in.
        // Playwright can check validity.

        const checkInInput = page.locator('#checkin');
        await expect(checkInInput).toHaveAttribute('required', '');

        // Try invalid date range (checkout before checkin)
        const today = new Date();
        const checkIn = today.toISOString().split('T')[0];
        // checkout yesterday
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const checkOut = yesterday.toISOString().split('T')[0];

        await page.fill('#checkin', checkIn);
        await page.fill('#checkout', checkOut);

        // Listen for alert
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Check-out date must be after check-in date');
            await dialog.dismiss();
        });

        await page.click('button:has-text("Verificar Disponibilidad")');
    });
});
