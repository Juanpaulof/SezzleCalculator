package com.sezzle.calculator.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;

import com.sezzle.calculator.exception.InvalidCalculationException;
import com.sezzle.calculator.model.calculation.Operation;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class CalculatorServiceTest {

    private final CalculatorService service = new CalculatorService();

    private static BigDecimal bd(String value) {
        return value == null ? null : new BigDecimal(value);
    }

    @ParameterizedTest(name = "{0}({1}, {2}) = {3}")
    @CsvSource({
            "ADD,        2,    3,    5",
            "ADD,        0.1,  0.2,  0.3",
            "SUBTRACT,   5,    8,    -3",
            "MULTIPLY,   2.5,  4,    10",
            "MULTIPLY,   0,    99,   0",
            "DIVIDE,     10,   4,    2.5",
            "DIVIDE,     1,    3,    0.33333333333333333333",
            "POWER,      2,    10,   1024",
            "POWER,      2,    -2,   0.25",
            "POWER,      5,    0,    1",
            "PERCENTAGE, 20,   150,  30",
            "PERCENTAGE, 7.5,  200,  15",
    })
    void binaryOperations(Operation op, String a, String b, String expected) {
        assertThat(service.calculate(op, bd(a), bd(b))).isEqualByComparingTo(expected);
    }

    @ParameterizedTest(name = "sqrt({0}) = {1}")
    @CsvSource({
            "9,    3",
            "0,    0",
            "2.25, 1.5",
    })
    void squareRoot(String a, String expected) {
        assertThat(service.calculate(Operation.SQRT, bd(a), null)).isEqualByComparingTo(expected);
    }

    @Test
    void resultsAreNormalisedWithoutTrailingZerosOrExponent() {
        assertThat(service.calculate(Operation.MULTIPLY, bd("2.50"), bd("4")).toPlainString()).isEqualTo("10");
        assertThat(service.calculate(Operation.MULTIPLY, bd("100"), bd("100")).toPlainString()).isEqualTo("10000");
    }

    @Test
    void divisionByZeroIsRejected() {
        assertThatThrownBy(() -> service.calculate(Operation.DIVIDE, bd("1"), bd("0")))
                .isInstanceOf(InvalidCalculationException.class)
                .hasMessageContaining("divide by zero");
    }

    @Test
    void squareRootOfNegativeIsRejected() {
        assertThatThrownBy(() -> service.calculate(Operation.SQRT, bd("-1"), null))
                .isInstanceOf(InvalidCalculationException.class);
    }

    @Test
    void fractionalExponentIsRejected() {
        assertThatThrownBy(() -> service.calculate(Operation.POWER, bd("4"), bd("0.5")))
                .isInstanceOf(InvalidCalculationException.class)
                .hasMessageContaining("whole number");
    }

    @Test
    void hugeExponentIsRejected() {
        assertThatThrownBy(() -> service.calculate(Operation.POWER, bd("2"), bd("1001")))
                .isInstanceOf(InvalidCalculationException.class);
    }

    @Test
    void zeroToNegativePowerIsRejected() {
        assertThatThrownBy(() -> service.calculate(Operation.POWER, bd("0"), bd("-1")))
                .isInstanceOf(InvalidCalculationException.class);
    }

    @Test
    void binaryOperationWithoutSecondOperandIsRejected() {
        assertThatThrownBy(() -> service.calculate(Operation.ADD, bd("1"), null))
                .isInstanceOf(InvalidCalculationException.class)
                .hasMessageContaining("two operands");
    }
}
