import { useEffect, useState } from "react";
import { ApiError, calculate, type CalculationRequest, type OperationId } from "./api";
import { BINARY_SYMBOLS, UNARY_SYMBOLS, type BinaryOperationId, type UnaryOperationId } from "./operations";
import { parseOperand } from "./validation";

const MAX_DIGITS = 15;

type KeyKind = "digit" | "operator" | "function" | "equals";

interface KeyDef {
  label: string;
  name: string;
  kind: KeyKind;
  onPress: () => void;
  active?: boolean;
  wide?: boolean;
}

export function Calculator() {
  const [display, setDisplay] = useState("0");
  const [operand, setOperand] = useState<string | null>(null);
  const [operator, setOperator] = useState<BinaryOperationId | null>(null);
  const [fresh, setFresh] = useState(true);
  const [percentApplied, setPercentApplied] = useState(false);
  const [expression, setExpression] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setDisplay("0");
    setOperand(null);
    setOperator(null);
    setFresh(true);
    setExpression("");
    setPercentApplied(false);
  }

  function fail(message: string): null {
    reset();
    setError(message);
    return null;
  }

  /** Validates the inputs, calls the backend, and returns the result (or null after showing an error). */
  async function compute(operation: OperationId, a: string, b?: string): Promise<string | null> {
    const first = parseOperand(a, "Number");
    if (!first.ok) return fail(first.error);
    let request: CalculationRequest = { operation, a: first.value };
    if (b !== undefined) {
      const second = parseOperand(b, "Number");
      if (!second.ok) return fail(second.error);
      request = { ...request, b: second.value };
    }

    setLoading(true);
    try {
      return (await calculate(request)).result;
    } catch (e) {
      return fail(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /** Runs an input handler unless a request is in flight, and clears any previous error. */
  function guarded<A extends unknown[]>(fn: (...args: A) => void | Promise<void>) {
    return (...args: A) => {
      if (loading) return;
      setError(null);
      setPercentApplied(false);
      return fn(...args);
    };
  }

  const inputDigit = guarded((digit: string) => {
    if (fresh) {
      setDisplay(digit);
      setFresh(false);
    } else if (display === "0") {
      setDisplay(digit);
    } else if (display.replace(/[-.]/g, "").length < MAX_DIGITS) {
      setDisplay(display + digit);
    }
  });

  const inputDecimal = guarded(() => {
    if (fresh) {
      setDisplay("0.");
      setFresh(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  });

  const backspace = guarded(() => {
    if (fresh) return;
    const next = display.slice(0, -1);
    setDisplay(next === "" || next === "-" ? "0" : next);
  });

  const negate = guarded(() => {
    if (display === "0") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
  });

  const clear = guarded(() => reset());

  const chooseOperator = guarded(async (op: BinaryOperationId) => {
    let left = operand;
    if (operator && operand !== null && (!fresh || percentApplied)) {
      // Chained operation (2 + 3 +): evaluate what we have so far.
      const result = await compute(operator, operand, display);
      if (result === null) return;
      left = result;
      setDisplay(result);
    } else if (!operator) {
      left = display;
    }
    setOperand(left);
    setOperator(op);
    setFresh(true);
    setExpression(`${left} ${BINARY_SYMBOLS[op]}`);
  });

  const equals = guarded(async () => {
    if (!operator || operand === null) return;
    const result = await compute(operator, operand, display);
    if (result === null) return;
    setExpression(`${operand} ${BINARY_SYMBOLS[operator]} ${display} =`);
    setDisplay(result);
    setOperand(null);
    setOperator(null);
    setFresh(true);
  });

  const applyUnary = guarded(async (op: UnaryOperationId) => {
    const result = await compute(op, display);
    if (result === null) return;
    setExpression(`${UNARY_SYMBOLS[op]}(${display})`);
    setDisplay(result);
    setFresh(true);
  });

  const applyPercent = guarded(async () => {
    // After "+" or "−", the typed number is a percentage OF the first number (200 + 10 % → 200 + 20).
    // Anywhere else it is a percentage of one (50 % → 0.5), so 150 × 20 % → 150 × 0.2.
    const base = !fresh && (operator === "ADD" || operator === "SUBTRACT") ? operand : null;

    const result = await compute("PERCENTAGE", display, base ?? "1");
    if (result === null) return;
    setExpression(base === null ? `${display}%` : `${display}% of ${base}`);
    setDisplay(result);
    setFresh(true);
    setPercentApplied(true);
  });

  // Keyboard support. Re-registered every render so handlers always see current state.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const operators: Record<string, BinaryOperationId> = {
        "+": "ADD", "-": "SUBTRACT", "*": "MULTIPLY", "/": "DIVIDE", "^": "POWER",
      };
      if (/^\d$/.test(e.key)) inputDigit(e.key);
      else if (e.key === "." || e.key === ",") inputDecimal();
      else if (e.key in operators) chooseOperator(operators[e.key]);
      else if (e.key === "Enter" || e.key === "=") equals();
      else if (e.key === "%") applyPercent();
      else if (e.key === "Backspace") backspace();
      else if (e.key === "Escape") clear();
      else return;
      e.preventDefault();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const opKey = (op: BinaryOperationId, name: string): KeyDef => ({
    label: BINARY_SYMBOLS[op], name, kind: "operator", active: operator === op && fresh, onPress: () => chooseOperator(op),
  });
  const digitKey = (d: string): KeyDef => ({ label: d, name: d, kind: "digit", onPress: () => inputDigit(d) });

  const keys: KeyDef[] = [
    { label: "√", name: "square root", kind: "function", wide: true, onPress: () => applyUnary("SQRT") },
    opKey("POWER", "power"),
    { label: "%", name: "percent", kind: "function", onPress: applyPercent },
    { label: "C", name: "clear", kind: "function", onPress: clear },
    { label: "⌫", name: "backspace", kind: "function", onPress: backspace },
    { label: "±", name: "negate", kind: "function", onPress: negate },
    opKey("DIVIDE", "divide"),
    digitKey("7"), digitKey("8"), digitKey("9"), opKey("MULTIPLY", "multiply"),
    digitKey("4"), digitKey("5"), digitKey("6"), opKey("SUBTRACT", "subtract"),
    digitKey("1"), digitKey("2"), digitKey("3"), opKey("ADD", "add"),
    { label: "0", name: "0", kind: "digit", wide: true, onPress: () => inputDigit("0") },
    { label: ".", name: "decimal point", kind: "digit", onPress: inputDecimal },
    { label: "=", name: "equals", kind: "equals", onPress: equals },
  ];

  return (
    <div className="calculator">
      <div className="screen">
        <div className="expression" aria-hidden="true">{expression || "\u00a0"}</div>
        <output className="display" aria-live="polite">{display}</output>
        <p className="error" role="alert">{error}</p>
      </div>
      <div className="keypad">
        {keys.map((key) => (
          <button
            key={key.name}
            type="button"
            aria-label={key.name}
            aria-pressed={key.kind === "operator" ? key.active === true : undefined}
            className={`key ${key.kind}${key.wide ? " wide" : ""}${key.active ? " active" : ""}`}
            disabled={loading}
            onClick={key.onPress}
          >
            {key.label}
          </button>
        ))}
      </div>
    </div>
  );
}
