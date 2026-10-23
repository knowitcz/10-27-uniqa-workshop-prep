import type { PolicyRecord } from '../../src/domain/types';
import { EXPIRING_POLICY } from '../builders/policy';
import { policyList } from '../pages/PolicyListPage';
import { calculator } from '../pages/CalculatorPage';
import {
  CHOSEN_COVERAGE,
  EXPIRING_IN_DAYS,
  MONTHS_AWAY_IN_DAYS,
  QUOTE_LOCK_NOTICE,
  RENEWAL_PREMIUM_NO_CLAIMS,
  RENEWAL_PREMIUM_THREE_CLAIMS,
  RENEWAL_PREMIUM_THREE_CLAIMS_CHOSEN_COVERAGE,
} from '../support/amounts';

describe('Renewal edge cases', () => {
  function openCalculatorWith(overrides: Partial<PolicyRecord> = {}) {
    calculator.visit(EXPIRING_POLICY, overrides);
  }

  it('shows five policies when the server returns the full payload', () => {
    // Arrange
    openCalculatorWith();

    // Act
    calculator.back();

    // Assert
    policyList.rows().should('have.length', 5);
  });

  it('shows the number of the policy due for renewal when the server returns the full payload', () => {
    // Arrange
    openCalculatorWith();

    // Act
    calculator.back();

    // Assert
    policyList.row(EXPIRING_POLICY).policyNo().should('contain', 'POL-4821');
  });

  it('shows the days until renewal for a policy due for renewal', () => {
    // Arrange
    openCalculatorWith({ renewalInDays: EXPIRING_IN_DAYS, priorClaims: 0 });

    // Act
    calculator.calculate();

    // Assert
    calculator.notice().should('contain', `expires in ${EXPIRING_IN_DAYS} days`);
  });

  it('shows how long the offer is valid for a policy due for renewal', () => {
    // Arrange
    openCalculatorWith({ renewalInDays: EXPIRING_IN_DAYS, priorClaims: 0 });

    // Act
    calculator.calculate();

    // Assert
    calculator.notice().should('contain', QUOTE_LOCK_NOTICE);
  });

  it('calculates the full premium on a policy due for renewal', () => {
    // Arrange
    openCalculatorWith({ renewalInDays: EXPIRING_IN_DAYS, priorClaims: 0 });

    // Act
    calculator.calculate();

    // Assert
    calculator.premium().should('contain', RENEWAL_PREMIUM_NO_CLAIMS);
  });

  it('shows no notice for a policy months away from renewal', () => {
    // Arrange
    openCalculatorWith({ renewalInDays: MONTHS_AWAY_IN_DAYS, priorClaims: 0 });

    // Act
    calculator.calculate();

    // Assert
    calculator.notice().should('not.exist');
  });

  it('calculates the same premium for a policy months away from renewal', () => {
    // Arrange
    openCalculatorWith({ renewalInDays: MONTHS_AWAY_IN_DAYS, priorClaims: 0 });

    // Act
    calculator.calculate();

    // Assert
    calculator.premium().should('contain', RENEWAL_PREMIUM_NO_CLAIMS);
  });

  it('prefills three previous claims from the policy', () => {
    // Arrange
    openCalculatorWith({ priorClaims: 3 });

    // Assert
    calculator.priorClaims().should('have.value', '3');
  });

  it('adds 45 % to the premium for three previous claims', () => {
    // Arrange
    openCalculatorWith({ priorClaims: 3 });

    // Act
    calculator.calculate();

    // Assert
    calculator.premium().should('contain', RENEWAL_PREMIUM_THREE_CLAIMS);
  });

  it('shows the 62 % coverage amount in the result', () => {
    // Arrange
    openCalculatorWith({ priorClaims: 3 });
    calculator.setCoverage(0.62);

    // Act
    calculator.calculate();

    // Assert
    calculator.summaryCoverage().should('contain', CHOSEN_COVERAGE);
  });

  it('counts three claims also at 62 % coverage', () => {
    // Arrange
    openCalculatorWith({ priorClaims: 3 });
    calculator.setCoverage(0.62);

    // Act
    calculator.calculate();

    // Assert
    calculator.premium().should('contain', RENEWAL_PREMIUM_THREE_CLAIMS_CHOSEN_COVERAGE);
  });

  it('shows no notice for a policy with a renewal date 200 days away', () => {
    // Arrange
    openCalculatorWith({ renewalInDays: MONTHS_AWAY_IN_DAYS, priorClaims: 3 });

    // Act
    calculator.calculate();

    // Assert
    calculator.notice().should('not.exist');
  });
});
