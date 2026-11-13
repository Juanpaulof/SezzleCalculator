# Sezzle Calculator

A full-stack calculator for Sezzle assesment: a **Spring Boot (Java 21)** REST API.

```
calculator/
├── frontend/   React 19 + TypeScript + Vite + Vitest
├── backend/    Spring Boot 4 + Gradle (Java 21)
├── Dockerfile  single image: backend +  frontend
└── PROMPTS.md  AI prompts used
```

## Features

| Operation | Notes |
|---|---|
| Add, Subtract, Multiply, Divide | Division by zero returns a clear error |
| Power | Whole-number exponents from -1000 to 1000 |
| Square root | Negative input rejected |
| Percent | `a` percent of `b` (20 and 150 gives 30) |

## Prerequisites

- JDK 21
- Gradle 8.14+ or 9.x (IntelliJ bundles one), or generate the wrapper once: `cd backend && gradle wrapper`
- Node.js 20+ and npm
- 
## Run locally

**Backend** (http://localhost:8080)

```bash
cd backend
./gradlew bootRun        # or: gradle bootRun
```

In IntelliJ: open the `backend` folder as a Gradle project, then run `CalculatorApplication`.

**Frontend** (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api/*` to `localhost:8080`, so no CORS configuration is needed.

## Run with Docker

```bash
docker build -t sezzle-calculator .
docker run --rm -p 8080:8080 sezzle-calculator
```

Open http://localhost:8080. Spring Boot serves both the API and the built frontend.

## Tests and coverage

```bash
# Backend: tests + JaCoCo report -> backend/build/reports/jacoco/test/html/index.html
cd backend && ./gradlew test

## API

### `POST /api/v1/calculate`

### Request

| Field | Type | Notes |
|---|---|---|
| `operation` | string | `ADD`, `SUBTRACT`, `MULTIPLY`, `DIVIDE`, `POWER`, `PERCENTAGE`, `SQRT` |
| `a` | number | required |
| `b` | number | required except for `SQRT` |

### Examples

**Windows CMD**

```bat
curl -s -X POST http://localhost:8080/api/v1/calculate -H "Content-Type: application/json" -d "{\"operation\":\"ADD\",\"a\":0.1,\"b\":0.2}"
```

```bat
curl -s -X POST http://localhost:8080/api/v1/calculate -H "Content-Type: application/json" -d "{\"operation\":\"SQRT\",\"a\":144}"
```

```bat
curl -i -s -X POST http://localhost:8080/api/v1/calculate -H "Content-Type: application/json" -d "{\"operation\":\"DIVIDE\",\"a\":1,\"b\":0}"
```

**Windows PowerShell**

```powershell
'{"operation":"ADD","a":0.1,"b":0.2}' | curl.exe -s -X POST http://localhost:8080/api/v1/calculate -H "Content-Type: application/json" -d "@-"
```

```powershell
'{"operation":"SQRT","a":144}' | curl.exe -s -X POST http://localhost:8080/api/v1/calculate -H "Content-Type: application/json" -d "@-"
```

```powershell
'{"operation":"DIVIDE","a":1,"b":0}' | curl.exe -i -s -X POST http://localhost:8080/api/v1/calculate -H "Content-Type: application/json" -d "@-"
```

**macOS / Linux**

```bash
curl -s -X POST http://localhost:8080/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"ADD","a":0.1,"b":0.2}'
```
# Frontend: tests + coverage report -> frontend/coverage/index.html
cd frontend && npm run test:coverage

### Expected responses

ADD:

```json
{"operation":"ADD","result":"0.3"}
```

SQRT:

```json
{"operation":"SQRT","result":"12"}
```

DIVIDE by zero (HTTP 400):

```json
{"error":"INVALID_CALCULATION","message":"Cannot divide by zero"}
```

Errors always return HTTP 400 with `{"error": CODE, "message": TEXT}`:

| Code | Cause |
|---|---|
| `INVALID_CALCULATION` | Division by zero, negative square root, fractional/huge exponent, missing `b` |
| `VALIDATION_FAILED` | Missing `operation` or `a` |
| `MALFORMED_REQUEST` | Invalid JSON, unknown operation, non-numeric operand |

## Design decisions

- **Java/Spring Boot instead of Go.** I used Spring Boot since I have much more experience with this techstack (IntelliJ, Java 21, Gradle) than Go. The API is a single small endpoint, so it would port to Go with no complications.
- **Spring Boot 4.0.x.** since it is the current major version of Spring Boot.
- **`BigDecimal` for all operations.** Avoids floating point issues (0.1 + 0.2 is exactly 0.3). Irrational and repeating decimals (such as 1/3 and sqrt(2)) are rounded to 20 significant digits.
- **Result returned as a string.** JSON numbers are parsed as doubles in JavaScript, so this prevents future issues with precision.
- **One endpoint with an `operation` field** instead of one endpoint per operation.
- **Using `ApiExceptionHandler`** to turn every exception into one consistent JSON instead of having `CalculatorService` handling exceptions. 
- **Exponent is capped** at ±1000 so a request like `9^999999999` cannot exhaust CPU or memory.
- **Controller tests use standalone MockMvc.** Fast, with no application context needed.

## Assumptions and limitations

- Percent means "number a percent of number b" and the UI uses b = 1 for a plain percent.
- No authentication, persistence or rate limiting; out of scope for this exercise.
- AI Tool had creative freedom styling the calculator. Only instruction was to look as Windows' Calculator.
- AI Tool had creative freedom for developing testing for the frontend component (Vitest).
- Scientific notation (`1e5`) is not accepted in the UI.