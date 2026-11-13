import type { OperationId } from "./api";

/** Operators that combine two numbers, with the symbol shown on the keypad and display. */
export const BINARY_SYMBOLS = {
  ADD: "+",
  SUBTRACT: "−",
  MULTIPLY: "×",
  DIVIDE: "÷",
  POWER: "^",
} as const satisfies Partial<Record<OperationId, string>>;

export type BinaryOperationId = keyof typeof BINARY_SYMBOLS;
export const UNARY_SYMBOLS = {
  SQRT: "√",
} as const satisfies Partial<Record<OperationId, string>>;

export type UnaryOperationId = keyof typeof UNARY_SYMBOLS;
