import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Calculator} from "./Calculator";
import * as api from "./api";

afterEach(() => vi.restoreAllMocks());

const display = () => screen.getByRole("status");

async function press(user: ReturnType<typeof userEvent.setup>, ...names: string[]) {
    for (const name of names) {
        await user.click(screen.getByRole("button", {name}));
    }
}

describe("Calculator", () => {
    it("starts at zero", () => {
        render(<Calculator/>);
        expect(display()).toHaveTextContent("0");
    });

    it("builds numbers from digit presses and supports decimals, negation and backspace", async () => {
        const user = userEvent.setup();
        render(<Calculator/>);

        await press(user, "1", "2", "decimal point", "decimal point", "5");
        expect(display()).toHaveTextContent("12.5");

        await press(user, "negate");
        expect(display()).toHaveTextContent("-12.5");

        await press(user, "backspace", "backspace");
        expect(display()).toHaveTextContent("-12");

        await press(user, "clear");
        expect(display()).toHaveTextContent("0");
    });

    it("evaluates a binary operation through the API", async () => {
        const spy = vi.spyOn(api, "calculate").mockResolvedValue({operation: "ADD", result: "5"});
        const user = userEvent.setup();
        render(<Calculator/>);

        await press(user, "2", "add", "3", "equals");

        expect(spy).toHaveBeenCalledWith({operation: "ADD", a: 2, b: 3});
        expect(await screen.findByText("5", {selector: "output"})).toBeInTheDocument();
    });

    it("evaluates chained operations step by step", async () => {
        const spy = vi.spyOn(api, "calculate").mockResolvedValue({operation: "ADD", result: "5"});
        const user = userEvent.setup();
        render(<Calculator/>);

        await press(user, "2", "add", "3", "multiply");

        expect(spy).toHaveBeenCalledWith({operation: "ADD", a: 2, b: 3});
        expect(display()).toHaveTextContent("5");
    });

    it("applies square root immediately", async () => {
        const spy = vi.spyOn(api, "calculate").mockResolvedValue({operation: "SQRT", result: "4"});
        const user = userEvent.setup();
        render(<Calculator/>);

        await press(user, "1", "6", "square root");

        expect(spy).toHaveBeenCalledWith({operation: "SQRT", a: 16});
        expect(display()).toHaveTextContent("4");
    });

    it("turns percent into a division by 100 via the API", async () => {
        const spy = vi.spyOn(api, "calculate").mockResolvedValue({operation: "PERCENTAGE", result: "0.5"});
        const user = userEvent.setup();
        render(<Calculator/>);

        await press(user, "5", "0", "percent");

        expect(spy).toHaveBeenCalledWith({operation: "PERCENTAGE", a: 50, b: 1});
        expect(display()).toHaveTextContent("0.5");
    });

    it("shows the backend error and resets the calculator", async () => {
        vi.spyOn(api, "calculate").mockRejectedValue(new api.ApiError("Cannot divide by zero"));
        const user = userEvent.setup();
        render(<Calculator/>);

        await press(user, "1", "divide", "0", "equals");

        expect(await screen.findByRole("alert")).toHaveTextContent("Cannot divide by zero");
        expect(display()).toHaveTextContent("0");

        await press(user, "7");
        expect(screen.getByRole("alert")).toBeEmptyDOMElement();
    });

    it("limits the number of digits that can be typed", async () => {
        const user = userEvent.setup();
        render(<Calculator/>);

        await press(user, ...Array<string>(20).fill("9"));

        expect(display()).toHaveTextContent("9".repeat(15));
        expect(display().textContent).toHaveLength(15);
    });

    it("works with the keyboard", async () => {
        const spy = vi.spyOn(api, "calculate").mockResolvedValue({operation: "MULTIPLY", result: "12"});
        const user = userEvent.setup();
        render(<Calculator/>);

        await user.keyboard("3*4{Enter}");

        expect(spy).toHaveBeenCalledWith({operation: "MULTIPLY", a: 3, b: 4});
    });

    it("treats % after + as a percentage of the first number", async () => {
        const spy = vi
            .spyOn(api, "calculate")
            .mockResolvedValueOnce({operation: "PERCENTAGE", result: "20"})
            .mockResolvedValueOnce({operation: "ADD", result: "220"});
        const user = userEvent.setup();
        render(<Calculator/>);

        await press(user, "2", "0", "0", "add", "1", "0", "percent");
        expect(spy).toHaveBeenNthCalledWith(1, {operation: "PERCENTAGE", a: 10, b: 200});
        expect(display()).toHaveTextContent("20");

        await press(user, "equals");
        expect(spy).toHaveBeenNthCalledWith(2, {operation: "ADD", a: 200, b: 20});
        expect(display()).toHaveTextContent("220");
    });

    it("treats % after × as a percentage of one", async () => {
        const spy = vi.spyOn(api, "calculate").mockResolvedValue({operation: "PERCENTAGE", result: "0.2"});
        const user = userEvent.setup();
        render(<Calculator/>);

        await press(user, "1", "5", "0", "multiply", "2", "0", "percent");

        expect(spy).toHaveBeenCalledWith({operation: "PERCENTAGE", a: 20, b: 1});
        expect(display()).toHaveTextContent("0.2");
    });

    it("keeps the pending operation when an operator follows %", async () => {
        const spy = vi
            .spyOn(api, "calculate")
            .mockResolvedValueOnce({operation: "PERCENTAGE", result: "20"})
            .mockResolvedValueOnce({operation: "ADD", result: "220"});
        const user = userEvent.setup();
        render(<Calculator/>);

        await press(user, "2", "0", "0", "add", "1", "0", "percent", "add");

        expect(spy).toHaveBeenNthCalledWith(2, {operation: "ADD", a: 200, b: 20});
        expect(display()).toHaveTextContent("220");
    });
});
