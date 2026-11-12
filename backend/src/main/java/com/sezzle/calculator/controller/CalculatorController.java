package com.sezzle.calculator.controller;

import com.sezzle.calculator.service.CalculatorService;
import com.sezzle.calculator.dto.request.CalculationRequest;
import com.sezzle.calculator.dto.response.CalculationResponse;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/calculate")
public class CalculatorController {

    private final CalculatorService service;

    public CalculatorController(CalculatorService service) {
        this.service = service;
    }

    @PostMapping
    public CalculationResponse calculate(@Valid @RequestBody CalculationRequest request) {
        var result = service.calculate(request.operation(), request.a(), request.b());
        return new CalculationResponse(request.operation(), result.toPlainString());
    }
}
