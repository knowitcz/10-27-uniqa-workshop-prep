import { ACTIVE_POLICY, EXPIRING_POLICY, MANY_CLAIMS_POLICY, RENEWED_POLICY } from '../builders/policy';
import { policyList } from '../pages/PolicyListPage';
import { calculator } from '../pages/CalculatorPage';
import {
  CHOSEN_COVERAGE,
  CHOSEN_COVERAGE_PCT,
  DEFAULT_COVERAGE,
  DEFAULT_COVERAGE_PCT,
  RENEWAL_PREMIUM_BRNO_LOYAL,
  RENEWAL_PREMIUM_PRAGUE_LOYAL,
} from '../support/amounts';

describe('Renewal flow', () => {
  beforeEach(() => {
    // Arrange
    policyList.visit();
  });

  function openPolicyToRenew() {
    policyList.row(ACTIVE_POLICY).renewButton().click();
  }

  function renewPolicy() {
    openPolicyToRenew();
    calculator.calculate();
    calculator.continueToConfirmation();
    cy.get('[data-cy=confirm]').click();
  }

  it('shows policy number POL-1002 in the list', () => {
    // Assert
    policyList.row(ACTIVE_POLICY).policyNo().should('contain', 'POL-1002');
  });

  it('shows the Active status for policy POL-1002', () => {
    // Assert
    policyList.row(ACTIVE_POLICY).status().should('contain', 'Active');
  });

  it('allows renewing policy POL-1002', () => {
    // Assert
    policyList.row(ACTIVE_POLICY).renewButton().should('not.be.disabled');
  });

  it('opens the calculator for policy POL-1002', () => {
    // Act
    openPolicyToRenew();

    // Assert
    calculator.heading().should('contain', 'POL-1002');
  });

  it('prefills the policyholder name of policy POL-1002', () => {
    // Act
    openPolicyToRenew();

    // Assert
    calculator.policyholderName().should('have.value', 'Petr Svoboda');
  });

  it('prefills the policyholder age of policy POL-1002', () => {
    // Act
    openPolicyToRenew();

    // Assert
    calculator.age().should('have.value', '41');
  });

  it('prefills the region of policy POL-1002', () => {
    // Act
    openPolicyToRenew();

    // Assert
    calculator.region().should('have.value', 'Brno');
  });

  it('prefills zero claims for policy POL-1002', () => {
    // Act
    openPolicyToRenew();

    // Assert
    calculator.priorClaims().should('have.value', '0');
  });

  it('calculates the premium with the loyalty discount for a policy in Brno', () => {
    // Arrange
    openPolicyToRenew();

    // Act
    calculator.calculate();

    // Assert
    calculator.premium().should('contain', RENEWAL_PREMIUM_BRNO_LOYAL);
  });

  it('shows policy number POL-1002 in the result', () => {
    // Arrange
    openPolicyToRenew();

    // Act
    calculator.calculate();

    // Assert
    calculator.summaryPolicy().should('contain', 'POL-1002');
  });

  it('shows the default 50 % coverage in the result', () => {
    // Arrange
    openPolicyToRenew();

    // Act
    calculator.calculate();

    // Assert
    calculator.summaryCoverage().should('contain', DEFAULT_COVERAGE_PCT);
  });

  it('shows the default coverage amount in the result', () => {
    // Arrange
    openPolicyToRenew();

    // Act
    calculator.calculate();

    // Assert
    calculator.summaryCoverage().should('contain', DEFAULT_COVERAGE);
  });

  it('shows zero claims in the result', () => {
    // Arrange
    openPolicyToRenew();

    // Act
    calculator.calculate();

    // Assert
    calculator.summaryClaims().should('contain', '0');
  });

  it('shows no notice for a policy months away from renewal', () => {
    // Arrange
    openPolicyToRenew();

    // Act
    calculator.calculate();

    // Assert
    calculator.notice().should('not.exist');
  });

  it('returns to the policy list after the renewal is confirmed', () => {
    // Arrange
    openPolicyToRenew();
    calculator.calculate();

    // Act
    calculator.continueToConfirmation();
    cy.get('[data-cy=confirm]').click();

    // Assert
    policyList.rows().should('have.length', 5);
  });

  it('shows the Renewed status after policy POL-1002 is renewed', () => {
    // Arrange
    renewPolicy();

    // Assert
    policyList.row(ACTIVE_POLICY).status().should('contain', 'Renewed');
  });

  it('disables the Renew button after policy POL-1002 is renewed', () => {
    // Arrange
    renewPolicy();

    // Assert
    policyList.row(ACTIVE_POLICY).renewButton().should('be.disabled');
  });

  it('disables the Renew button for a policy already renewed in the data', () => {
    // Assert
    policyList.row(RENEWED_POLICY).renewButton().should('be.disabled');
  });

  it('enables the Renew button for a policy due for renewal', () => {
    // Assert
    policyList.row(EXPIRING_POLICY).renewButton().should('not.be.disabled');
  });

  it('carries the chosen 62 % coverage into the result for policy POL-7781', () => {
    // Arrange
    policyList.row(MANY_CLAIMS_POLICY).renewButton().click();
    calculator.enterPriorClaims(0);
    calculator.setCoverage(0.62);

    // Act
    calculator.calculate();

    // Assert
    calculator.summaryCoverage().should('contain', CHOSEN_COVERAGE_PCT);
  });

  it('carries the coverage amount into the result for policy POL-7781', () => {
    // Arrange
    policyList.row(MANY_CLAIMS_POLICY).renewButton().click();
    calculator.enterPriorClaims(0);
    calculator.setCoverage(0.62);

    // Act
    calculator.calculate();

    // Assert
    calculator.summaryCoverage().should('contain', CHOSEN_COVERAGE);
  });

  it('calculates the premium with the loyalty discount for policy POL-7781', () => {
    // Arrange
    policyList.row(MANY_CLAIMS_POLICY).renewButton().click();
    calculator.enterPriorClaims(0);
    calculator.setCoverage(0.62);

    // Act
    calculator.calculate();

    // Assert
    calculator.premium().should('contain', RENEWAL_PREMIUM_PRAGUE_LOYAL);
  });
});
