package com.sezzle.calculator.model.calculation;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.Locale;

/**
 * Supported calculator operations. {@code unary} operations only use operand {@code a}.
 */
public enum Operation {
    ADD(false),
    SUBTRACT(false),
    MULTIPLY(false),
    DIVIDE(false),
    POWER(false),
    PERCENTAGE(false),
    SQRT(true);

    private final boolean unary;

    Operation(boolean unary) {
        this.unary = unary;
    }

    public boolean isUnary() {
        return unary;
    }

    @JsonCreator
    public static Operation fromJson(String value) {
        return valueOf(value.trim().toUpperCase(Locale.ROOT));
    }
}
