import { expect, test } from "./fixtures/auth.fixture";

test.describe("auth", () => {
  test("shows invalid credential error on login", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        json: { error: "Credenciales inválidas" }
      });
    });

    await page.goto("/login");
    await page.getByLabel("Email").fill("wrong@residente.test");
    await page.getByLabel("Contraseña").fill("password123");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page.getByText("Credenciales inválidas")).toBeVisible();
  });

  test("logs in and redirects to app", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        json: {
          user: {
            id: "student-1",
            email: "student@residente.test",
            role: "STUDENT",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z"
          }
        }
      });
    });
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        json: {
          user: {
            id: "student-1",
            email: "student@residente.test",
            role: "STUDENT",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z"
          }
        }
      });
    });

    await page.goto("/login");
    await page.getByLabel("Email").fill("student@residente.test");
    await page.getByLabel("Contraseña").fill("password123");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page).toHaveURL(/\/app/);
  });
});
