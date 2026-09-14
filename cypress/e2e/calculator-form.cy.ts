import { aPolicyList, EXPIRING } from '../builders/policy';
import {
  DEFAULT_COVERAGE_PCT,
  MINIMAL_COVERAGE_FRACTION,
  RENEWAL_PREMIUM_AT_1_PCT,
  RENEWAL_PREMIUM_NO_CLAIMS,
  RENEWAL_PREMIUM_ONE_CLAIM,
} from '../support/amounts';
import calculator from '../pages/CalculatorPage';

describe('Calculator form', () => {
  beforeEach(() => {
    // Arrange
    calculator.open(EXPIRING, aPolicyList());
  });

  it('reports two errors on an empty form', () => {
    // Arrange
    cy.get(calculator.selectors.policyholderName).clear();
    cy.get(calculator.selectors.age).clear();

    // Act
    calculator.calculate();

    // Assert
    cy.get('.error').should('have.length', 2);
  });

  it('reports a missing policyholder name', () => {
    // Arrange
    cy.get(calculator.selectors.policyholderName).clear();
    cy.get(calculator.selectors.age).clear();

    // Act
    calculator.calculate();

    // Assert
    cy.get('.error').eq(0).should('contain', 'Policyholder name is required');
  });

  it('reports a missing age', () => {
    // Arrange
    cy.get(calculator.selectors.policyholderName).clear();
    cy.get(calculator.selectors.age).clear();

    // Act
    calculator.calculate();

    // Assert
    cy.get('.error').eq(1).should('contain', 'Age is required');
  });

  it('does not show a result when the form fails validation', () => {
    // Arrange
    cy.get(calculator.selectors.policyholderName).clear();
    cy.get(calculator.selectors.age).clear();

    // Act
    calculator.calculate();

    // Assert
    calculator.verifyNoResult();
  });

  it('calculates the premium for a policy with no previous claims', () => {
    // Arrange
    calculator.enterPriorClaims(0);

    // Act
    calculator.calculate();

    // Assert
    calculator.verifyPremium(RENEWAL_PREMIUM_NO_CLAIMS);
  });

  it('shows the policy number in the result', () => {
    // Arrange
    calculator.enterPriorClaims(0);

    // Act
    calculator.calculate();

    // Assert
    cy.get(calculator.selectors.summaryRow).eq(0).should('contain', 'POL-4821');
  });

  it('shows the number of previous claims in the result', () => {
    // Arrange
    calculator.enterPriorClaims(0);

    // Act
    calculator.calculate();

    // Assert
    cy.get(calculator.selectors.summaryRow).eq(2).should('contain', '0');
  });

  it('shows the locked-offer notice for a policy due for renewal', () => {
    // Arrange
    calculator.enterPriorClaims(0);

    // Act
    calculator.calculate();

    // Assert
    cy.expectText('.notice', 'The quote is locked for 7 days');
  });

  it('adds 15 % to the premium for one previous claim', () => {
    // Act
    calculator.calculate();

    // Assert
    calculator.verifyPremium(RENEWAL_PREMIUM_ONE_CLAIM);
  });

  it('hides the result after the form is reset', () => {
    // Arrange
    calculator.enterPriorClaims(0);
    calculator.calculate();
    calculator.verifyPremium(RENEWAL_PREMIUM_NO_CLAIMS);

    // Act
    calculator.reset();

    // Assert
    calculator.verifyNoResult();
  });

  it('restores the age from the policy after the form is reset', () => {
    // Arrange
    calculator.enterAge(30);

    // Act
    calculator.reset();

    // Assert
    cy.get(calculator.selectors.age).should('have.value', '22');
  });

  it('restores the previous claims from the policy after the form is reset', () => {
    // Arrange
    calculator.enterPriorClaims(0);

    // Act
    calculator.reset();

    // Assert
    cy.get(calculator.selectors.priorClaims).should('have.value', '1');
  });

  it('returns coverage to 50 % after the form is reset', () => {
    // Arrange
    calculator.drag(0.9);

    // Act
    calculator.reset();

    // Assert
    calculator.verifyCoverage(DEFAULT_COVERAGE_PCT);
  });

  it('scales the premium with the chosen coverage', () => {
    // Arrange
    calculator.enterPriorClaims(0);
    calculator.drag(MINIMAL_COVERAGE_FRACTION);

    // Act
    calculator.calculate();

    // Assert
    calculator.verifyPremium(RENEWAL_PREMIUM_AT_1_PCT);
  });
});
