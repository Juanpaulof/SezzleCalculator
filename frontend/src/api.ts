export type OperationId = "ADD" | "SUBTRACT" | "MULTIPLY" | "DIVIDE" | "POWER" | "PERCENTAGE" | "SQRT";

export interface CalculationRequest {
  operation: OperationId;
  a: number;
  b?: number;
}

export interface CalculationResponse {
  operation: OperationId;
  result: string;
}

/** Error with a message that is safe to show to the user. */
export class ApiError extends Error {}

export async function calculate(request: CalculationRequest): Promise<CalculationResponse> {
  let response: Response;
  try {
    response = await fetch("/api/v1/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new ApiError("Could not reach the calculator service. Please try again.");
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(body?.message ?? `Calculation failed (HTTP ${response.status})`);
  }
  return body as CalculationResponse;
}
