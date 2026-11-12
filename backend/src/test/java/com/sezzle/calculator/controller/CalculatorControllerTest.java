package com.sezzle.calculator.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sezzle.calculator.service.CalculatorService;

import com.sezzle.calculator.exception.ApiExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class CalculatorControllerTest {

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders
                .standaloneSetup(new CalculatorController(new CalculatorService()))
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    private org.springframework.test.web.servlet.ResultActions call(String json) throws Exception {
        return mvc.perform(post("/api/v1/calculate").contentType(MediaType.APPLICATION_JSON).content(json));
    }

    @Test
    void addsTwoNumbers() throws Exception {
        call("{\"operation\":\"ADD\",\"a\":0.1,\"b\":0.2}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.operation").value("ADD"))
                .andExpect(jsonPath("$.result").value("0.3"));
    }

    @Test
    void squareRootIgnoresSecondOperand() throws Exception {
        call("{\"operation\":\"SQRT\",\"a\":16}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("4"));
    }

    @Test
    void divisionByZeroReturns400() throws Exception {
        call("{\"operation\":\"DIVIDE\",\"a\":1,\"b\":0}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_CALCULATION"))
                .andExpect(jsonPath("$.message").value("Cannot divide by zero"));
    }

    @Test
    void missingOperationReturns400() throws Exception {
        call("{\"a\":1,\"b\":2}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    void unknownOperationReturns400() throws Exception {
        call("{\"operation\":\"MODULO\",\"a\":1,\"b\":2}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("MALFORMED_REQUEST"));
    }

    @Test
    void nonNumericOperandReturns400() throws Exception {
        call("{\"operation\":\"ADD\",\"a\":\"abc\",\"b\":2}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("MALFORMED_REQUEST"));
    }

    @Test
    void missingSecondOperandForBinaryOperationReturns400() throws Exception {
        call("{\"operation\":\"MULTIPLY\",\"a\":3}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_CALCULATION"));
    }

    @Test
    void convertsOperationToLowerCase() throws Exception {
        call("{\"operation\":\"add\",\"a\":0.1,\"b\":0.2}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.operation").value("ADD"))
                .andExpect(jsonPath("$.result").value("0.3"));
    }
}
