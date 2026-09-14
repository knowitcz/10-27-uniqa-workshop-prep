import { useState } from 'react';
import CoverageSlider, {
  offsetForFraction,
  SLIDER_MAX,
  SLIDER_MIN,
} from '../../src/components/CoverageSlider';

/**
 * The slider on its own — no app, no policy list, no navigation. These run in
 * milliseconds because there is nothing to boot.
 */

/** Wraps the controlled component so the tests can drive it like the app does. */
function Harness({ onChange }: { onChange?: (level: number) => void }) {
  const [value, setValue] = useState(50);
  return (
    <CoverageSlider
      value={value}
      onChange={(level) => {
        setValue(level);
        if (onChange) onChange(level);
      }}
    />
  );
}

/** Dispatch a pointer sequence at a fraction of the track. */
function dragTo(fraction: number, options: { release?: boolean } = {}) {
  cy.get('[data-cy=coverage-slider]').then(($el) => {
    const el = $el[0];
    el.setPointerCapture = () => {};
    el.hasPointerCapture = () => false;

    const rect = el.getBoundingClientRect();
    const at = {
      clientX: rect.left + offsetForFraction(fraction),
      clientY: rect.top + rect.height / 2,
      bubbles: true,
      pointerId: 1,
    };

    el.dispatchEvent(new PointerEvent('pointerdown', at));
    el.dispatchEvent(new PointerEvent('pointermove', at));
    if (options.release !== false) {
      el.dispatchEvent(new PointerEvent('pointerup', at));
    }
  });
}

describe('CoverageSlider', () => {
  it('starts at the value it is given from outside', () => {
    // Arrange
    cy.mount(<Harness />);

    // Assert
    cy.get('[data-cy=coverage-value]').should('contain', '50 %');
  });

  it('reports 0 % at the left edge of the track', () => {
    // Arrange
    cy.mount(<Harness />);

    // Act
    dragTo(0);

    // Assert
    cy.get('[data-cy=coverage-value]').should('contain', `${SLIDER_MIN} %`);
  });

  it('reports 100 % at the right edge of the track', () => {
    // Arrange
    cy.mount(<Harness />);

    // Act
    dragTo(1);

    // Assert
    cy.get('[data-cy=coverage-value]').should('contain', `${SLIDER_MAX} %`);
  });

  it('reports the exact percentage in the middle of the track', () => {
    // Arrange
    cy.mount(<Harness />);

    // Act
    dragTo(0.62);

    // Assert
    cy.get('[data-cy=coverage-value]').should('contain', '62 %');
  });

  it('converts the percentage into a coverage amount', () => {
    // Arrange
    cy.mount(<Harness />);

    // Act
    dragTo(0.62);

    // Assert
    cy.get('[data-cy=coverage-value]').should('contain', '248 000 CZK');
  });

  it('clamps the value at 100 % on a drag past the right edge', () => {
    // Arrange
    cy.mount(<Harness />);

    // Act
    dragTo(1.8);

    // Assert
    cy.get('[data-cy=coverage-value]').should('contain', '100 %');
  });

  it('clamps the value at 0 % on a drag past the left edge', () => {
    // Arrange
    cy.mount(<Harness />);

    // Act
    dragTo(-0.8);

    // Assert
    cy.get('[data-cy=coverage-value]').should('contain', '0 %');
  });

  it('moves the fill to the chosen percentage', () => {
    // Arrange
    cy.mount(<Harness />);

    // Act
    dragTo(0.62);

    // Assert
    cy.get('[data-cy=coverage-fill]').should('have.attr', 'style').and('contain', '62%');
  });

  it('reports the value even when a drag ends outside the control', () => {
    // Arrange
    cy.mount(<Harness />);

    // Act — pointerdown inside, released nowhere
    dragTo(0.25, { release: false });

    // Assert
    cy.get('[data-cy=coverage-value]').should('contain', '25 %');
  });

  it('does not change the value when the pointer moves without being pressed', () => {
    // Arrange
    cy.mount(<Harness />);

    // Act
    cy.get('[data-cy=coverage-slider]').then(($el) => {
      const el = $el[0];
      const rect = el.getBoundingClientRect();
      el.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: rect.left + offsetForFraction(0.9),
          clientY: rect.top + rect.height / 2,
          bubbles: true,
          pointerId: 1,
        })
      );
    });

    // Assert
    cy.get('[data-cy=coverage-value]').should('contain', '50 %');
  });

  it('reports the chosen value to the parent component', () => {
    // Arrange
    const onChange = cy.stub().as('onChange');
    cy.mount(<Harness onChange={onChange} />);

    // Act
    dragTo(0.75);

    // Assert
    cy.get('@onChange').should('have.been.calledWith', 75);
  });
});
