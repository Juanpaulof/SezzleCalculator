package com.sezzle.calculator.exception;

/** Thrown when a request is well-formed but cannot be calculated (e.g. divide by zero). */
public class InvalidCalculationException extends RuntimeException {

    public InvalidCalculationException(String message) {
        super(message);
    }
}
