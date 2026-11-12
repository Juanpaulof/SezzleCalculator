package com.sezzle.calculator.dto.request;

import java.math.BigDecimal;

import com.sezzle.calculator.model.calculation.Operation;
import jakarta.validation.constraints.NotNull;

public record CalculationRequest(
        @NotNull(message = "operation is required") Operation operation,
        @NotNull(message = "a is required") BigDecimal a,
        BigDecimal b) {
}
