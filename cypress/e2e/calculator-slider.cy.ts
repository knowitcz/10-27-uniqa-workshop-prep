import { EXPIRING_POLICY } from '../builders/policy';
import { calculator } from '../pages/CalculatorPage';
import {
  CHOSEN_COVERAGE,
  CHOSEN_COVERAGE_PCT,
  FULL_COVERAGE,
  FULL_COVERAGE_PCT,
  NO_COVERAGE,
  NO_COVERAGE_PCT,
  RENEWAL_PREMIUM_CHOSEN_COVERAGE,
} from '../support/amounts';

describe('Coverage slider', () => {
  beforeEach(() => {
    // Arrange
    calculator.visit(EXPIRING_POLICY);
  });

  it('shows the chosen coverage percentage after dragging the slider', () => {
    // Act
    calculator.setCoverage(0.62);

    // Assert
    calculator.coverageReadout().should('contain', CHOSEN_COVERAGE_PCT);
  });

  it('converts coverage into an amount in crowns', () => {
    // Act
    calculator.setCoverage(0.62);

    // Assert
    calculator.coverageReadout().should('contain', CHOSEN_COVERAGE);
  });


  it('sets coverage to 0 % at the left end of the slider', () => {
    // Act
    calculator.setCoverage(0);

    // Assert
    calculator.coverageReadout().should('contain', NO_COVERAGE_PCT);
  });

  it('shows no coverage amount at the left end of the slider', () => {
    // Act
    calculator.setCoverage(0);

    // Assert
    calculator.coverageReadout().should('contain', NO_COVERAGE);
  });

  it('sets coverage to 100 % at the right end of the slider', () => {
    // Act
    calculator.setCoverage(1);

    // Assert
    calculator.coverageReadout().should('contain', FULL_COVERAGE_PCT);
  });

  it('shows the full sum insured at 100 % coverage', () => {
    // Act
    calculator.setCoverage(1);

    // Assert
    calculator.coverageReadout().should('contain', FULL_COVERAGE);
  });



  it('carries the chosen coverage percentage into the result', () => {
    // Arrange
    calculator.enterPriorClaims(0);
    calculator.setCoverage(0.62);

    // Act
    calculator.calculate();

    // Assert
    calculator.summaryCoverage().should('contain', CHOSEN_COVERAGE_PCT);
  });

  it('carries the coverage amount into the result', () => {
    // Arrange
    calculator.enterPriorClaims(0);
    calculator.setCoverage(0.62);

    // Act
    calculator.calculate();

    // Assert
    calculator.summaryCoverage().should('contain', CHOSEN_COVERAGE);
  });

  it('calculates the premium at the chosen 62 % coverage', () => {
    // Arrange
    calculator.enterPriorClaims(0);
    calculator.setCoverage(0.62);

    // Act
    calculator.calculate();

    // Assert
    calculator.premium().should('contain', RENEWAL_PREMIUM_CHOSEN_COVERAGE);
  });
});
