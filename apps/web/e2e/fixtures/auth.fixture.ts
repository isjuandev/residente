import { test as base, Page } from "@playwright/test";
import { diseasePage, primaryDisease, specialties, users } from "./test-data";

type RoleName = "student" | "admin";

async function mockApi(page: Page, role: RoleName = "student") {
  const user = users[role];

  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ json: { user } });
  });
  await page.route("**/api/auth/login", async (route) => {
    const body = route.request().postDataJSON() as { email?: string };
    if (body.email?.includes("wrong")) {
      await route.fulfill({
        status: 401,
        json: { error: "Credenciales inválidas" }
      });
      return;
    }
    await route.fulfill({ json: { user } });
  });
  await page.route("**/api/auth/register", async (route) => {
    const body = route.request().postDataJSON() as { email?: string };
    if (body.email?.includes("exists")) {
      await route.fulfill({ status: 409, json: { error: "Email en uso" } });
      return;
    }
    await route.fulfill({ json: { user: users.student } });
  });
  await page.route("**/api/auth/logout", async (route) => {
    await route.fulfill({ json: { ok: true } });
  });
  await page.route("**/api/specialties", async (route) => {
    await route.fulfill({ json: specialties });
  });
  await page.route("**/api/diseases/search**", async (route) => {
    await route.fulfill({ json: diseasePage() });
  });
  await page.route("**/api/favorites", async (route) => {
    await route.fulfill({ json: { ok: true, data: [] } });
  });
  await page.route("**/api/admin/diseases**", async (route) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        json: {
          ...primaryDisease,
          ...body,
          id: "created-disease",
          specialty: specialties[0],
          createdAt: primaryDisease.createdAt,
          updatedAt: primaryDisease.updatedAt
        }
      });
      return;
    }
    await route.fulfill({ json: diseasePage() });
  });
}

async function setAuthCookie(page: Page) {
  await page.context().addCookies([
    {
      name: "residente_access_token",
      value: "e2e-token",
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax"
    }
  ]);
}

export const test = base.extend<{
  studentPage: Page;
  adminPage: Page;
}>({
  studentPage: async ({ page }, use) => {
    await mockApi(page, "student");
    await setAuthCookie(page);
    await use(page);
  },
  adminPage: async ({ page }, use) => {
    await mockApi(page, "admin");
    await setAuthCookie(page);
    await use(page);
  }
});

export { expect } from "@playwright/test";
