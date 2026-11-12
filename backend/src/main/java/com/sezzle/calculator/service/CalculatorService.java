package com.sezzle.calculator.service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

import com.sezzle.calculator.exception.InvalidCalculationException;
import com.sezzle.calculator.model.calculation.Operation;
import org.springframework.stereotype.Service;

/**
 * Pure calculation logic. Uses {@link BigDecimal} so results are exact (0.1 + 0.2 = 0.3).
 */
@Service
public class CalculatorService {

    /** Digits kept for results that do not terminate (1/3, sqrt(2), negative powers). */
    private static final MathContext MC = new MathContext(20, RoundingMode.HALF_UP);

    /** Guard against requests like 9^999999999 that would exhaust CPU and memory. */
    static final int MAX_EXPONENT = 1000;

    public BigDecimal calculate(Operation operation, BigDecimal a, BigDecimal b) {
        if (!operation.isUnary() && b == null) {
            throw new InvalidCalculationException("Operation " + operation + " requires two operands");
        }
        BigDecimal result = switch (operation) {
            case ADD -> a.add(b);
            case SUBTRACT -> a.subtract(b);
            case MULTIPLY -> a.multiply(b);
            case DIVIDE -> divide(a, b);
            case POWER -> power(a, b);
            case PERCENTAGE -> a.multiply(b).divide(BigDecimal.valueOf(100), MC);
            case SQRT -> sqrt(a);
        };
        return normalize(result);
    }

    private BigDecimal divide(BigDecimal a, BigDecimal b) {
        if (b.signum() == 0) {
            throw new InvalidCalculationException("Cannot divide by zero");
        }
        return a.divide(b, MC);
    }

    private BigDecimal power(BigDecimal base, BigDecimal exponent) {
        int n;
        try {
            n = exponent.intValueExact();
        } catch (ArithmeticException e) {
            throw new InvalidCalculationException("Exponent must be a whole number");
        }
        if (Math.abs(n) > MAX_EXPONENT) {
            throw new InvalidCalculationException("Exponent must be between -" + MAX_EXPONENT + " and " + MAX_EXPONENT);
        }
        if (n < 0 && base.signum() == 0) {
            throw new InvalidCalculationException("Zero cannot be raised to a negative power");
        }
        return n >= 0 ? base.pow(n) : BigDecimal.ONE.divide(base.pow(-n), MC);
    }

    private BigDecimal sqrt(BigDecimal a) {
        if (a.signum() < 0) {
            throw new InvalidCalculationException("Cannot take the square root of a negative number");
        }
        return a.sqrt(MC);
    }

    /** Strips trailing zeros so 2.50 -> 2.5, and avoids scientific notation like 1E+2. */
    private BigDecimal normalize(BigDecimal value) {
        BigDecimal stripped = value.signum() == 0 ? BigDecimal.ZERO : value.stripTrailingZeros();
        return stripped.scale() < 0 ? stripped.setScale(0) : stripped;
    }
}
