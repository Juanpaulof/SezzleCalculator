package com.sezzle.calculator.dto.response;

import com.sezzle.calculator.model.calculation.Operation;

public record CalculationResponse(Operation operation, String result) {
}
