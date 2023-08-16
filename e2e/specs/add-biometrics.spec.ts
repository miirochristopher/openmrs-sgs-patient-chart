import { test } from '../core';
import { BiometricsAndVitalsPage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient, startVisit, endVisit } from '../commands';
import { Visit } from '@openmrs/esm-framework';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Record biometrics of the patient', async ({ page, api }) => {
  const biometricsPage = new BiometricsAndVitalsPage(page);

  await test.step('When I visit the patient biometirics and vitals page', async () => {
    await biometricsPage.goto(patient.uuid);
  });

  await test.step('And I click record biometrics button', async () => {
    await biometricsPage.page.getByText('Record biometrics').click();
  });

  await test.step('And I fill the form', async () => {
    await biometricsPage.page.getByTitle('Height').fill('170');
    await biometricsPage.page.getByTitle('Weight').fill('65');
    await expect(biometricsPage.page.getByTitle('BMI')).toHaveValue('22.5');
    await biometricsPage.page.getByTitle('MUAC').fill('25');
  });

  await test.step('And I submit the form', async () => {
    await biometricsPage.page.getByText('Save').click();
  });

  await test.step('And I should see the success message', async () => {
    await expect(biometricsPage.page.getByText('saved')).toBeVisible();
  });

  await test.step('Then I should see the biometrics record', async () => {
    await biometricsPage.page.reload();
    await expect(biometricsPage.biometricsTable().getByText('170')).toBeVisible();
    await expect(biometricsPage.biometricsTable().getByText('65')).toBeVisible();
    await expect(biometricsPage.biometricsTable().getByText('22.5')).toBeVisible();
    await expect(biometricsPage.biometricsTable().getByText('25')).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});