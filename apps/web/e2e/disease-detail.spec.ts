import { expect, test } from "./fixtures/auth.fixture";
import { primaryDisease } from "./fixtures/test-data";

test("renders disease detail sections and favorite action", async ({ studentPage }) => {
  await studentPage.route("**/api/diseases/sindrome-coronario-agudo", async (route) => {
    await route.fulfill({ json: primaryDisease });
  });

  await studentPage.goto("/app/diseases/sindrome-coronario-agudo");

  await expect(studentPage.getByRole("heading", { name: primaryDisease.name })).toBeVisible();
  await expect(studentPage.getByText("Presentaciones clínicas")).toBeVisible();
  await expect(studentPage.getByText("Pasos del algoritmo")).toBeVisible();
  await expect(studentPage.getByText("Tablas clínicas")).toBeVisible();
  await expect(studentPage.getByText("Referencias")).toBeVisible();

  await studentPage.getByRole("button", { name: "Guardar favorito" }).click();
  await expect(studentPage.getByText(/No se pudo actualizar favorito/)).toHaveCount(0);
});
