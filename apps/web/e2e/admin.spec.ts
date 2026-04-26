import { expect, test } from "./fixtures/auth.fixture";

test("admin dashboard is visible for admin user", async ({ adminPage }) => {
  await adminPage.goto("/admin/dashboard");

  await expect(adminPage.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(adminPage.getByText("admin@residente.test")).toBeVisible();
});

test("admin diseases lists and opens editor", async ({ adminPage }) => {
  await adminPage.goto("/admin/diseases");

  await expect(adminPage.getByRole("heading", { name: "Enfermedades" })).toBeVisible();
  await expect(adminPage.getByText("Síndrome coronario agudo")).toBeVisible();

  await adminPage.getByRole("button", { name: "Editar" }).click();
  await expect(adminPage.getByLabel("Nombre")).toHaveValue("Síndrome coronario agudo");
});
