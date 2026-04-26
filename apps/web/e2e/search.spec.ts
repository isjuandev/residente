import { expect, test } from "./fixtures/auth.fixture";

test("searches diseases and navigates to detail", async ({ studentPage }) => {
  await studentPage.goto("/app");
  await studentPage
    .getByRole("combobox", { name: "Buscar enfermedades" })
    .fill("dolor");

  await expect(
    studentPage.getByRole("option", { name: /Síndrome coronario agudo/ })
  ).toBeVisible();

  await studentPage
    .getByRole("option", { name: /Síndrome coronario agudo/ })
    .click();

  await expect(studentPage).toHaveURL(/\/app\/diseases\/sindrome-coronario-agudo/);
});
