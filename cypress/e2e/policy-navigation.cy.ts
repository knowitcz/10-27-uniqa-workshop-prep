import { EXPIRING_POLICY } from '../builders/policy';
import { policyList } from '../pages/PolicyListPage';
import { DEFAULT_COVERAGE_PCT } from '../support/amounts';
import { calculator } from '../pages/CalculatorPage';

describe('Navigating to the calculator', () => {
  beforeEach(() => {
    // Arrange
    calculator.visit(EXPIRING_POLICY);
  });

  it('opens the calculator for the selected policy', () => {
    // Assert
    calculator.heading().should('contain', 'POL-4821');
  });

  it('prefills the policyholder name from the policy', () => {
    // Assert
    calculator.policyholderName().should('have.value', 'Jana Nováková');
  });

  it('prefills the policyholder age from the policy', () => {
    // Assert
    calculator.age().should('have.value', '22');
  });

  it('prefills the region from the policy', () => {
    // Assert
    calculator.region().should('have.value', 'Prague');
  });

  it('prefills the number of previous claims from the policy', () => {
    // Assert
    calculator.priorClaims().should('have.value', '1');
  });

  it('returns to the policy list after clicking Back', () => {
    // Act
    calculator.back();

    // Assert
    policyList.rows().should('have.length', 5);
  });

  it('shows the policyholder details section', () => {
    // Assert
    calculator.sectionLabels().eq(0).should('contain', 'Policyholder');
  });

  it('shows the renewal details section', () => {
    // Assert
    calculator.sectionLabels().eq(1).should('contain', 'Renewal details');
  });

  it('shows no premium before calculating', () => {
    // Assert
    calculator.premium().should('not.exist');
  });

  it('shows the coverage slider', () => {
    // Assert
    calculator.slider().should('be.visible');
  });

  it('sets coverage to the default 50 %', () => {
    // Assert
    calculator.coverageReadout().should('contain', DEFAULT_COVERAGE_PCT);
  });
});
