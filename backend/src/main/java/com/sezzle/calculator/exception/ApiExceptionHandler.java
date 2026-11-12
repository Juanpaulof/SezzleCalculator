package com.sezzle.calculator.exception;

import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Maps every failure to a consistent {"error": "...", "message": "..."} JSON body. */
@RestControllerAdvice
public class ApiExceptionHandler {

    /** For invalid operations, such as DIVIDE by zero. */
    @ExceptionHandler(InvalidCalculationException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCalculation(InvalidCalculationException ex) {
        return badRequest("INVALID_CALCULATION", ex.getMessage());
    }

    /** For invalid requests, such as missing Operation or missing first number. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getDefaultMessage())
                .sorted()
                .collect(Collectors.joining("; "));
        return badRequest("VALIDATION_FAILED", message);
    }

    /** For malformed JSON, unknown operation name, or non-numeric operand. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable(HttpMessageNotReadableException ex) {
        return badRequest("MALFORMED_REQUEST",
                "Request body must be valid JSON with a known operation and numeric operands");
    }

    private ResponseEntity<ErrorResponse> badRequest(String code, String message) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(code, message));
    }
}
