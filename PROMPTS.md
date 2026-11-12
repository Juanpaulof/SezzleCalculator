# Prompts used

AI tool: Claude (Anthropic).

## Backend prompts
> "I've received a requirement to create a full stack application of a calculator.
> Please build the backend structure with one single endpoint /api/v1/calculate.>
> I use IntelliJ with Java Amazon Coretto 21.0.11. Let's use SpringBoot, use the version of it
> that you consider best. Use Gradle for the dependency management.> 
> Include the project structure for controller, service and responses/requests. > 
> Also include Exceptions, but instead of using Spring Boot to handle exceptions in its code, let's have a global
> exception handler (@RestControllerAdvice)."
> 
> "Let's make the request for OPERATION not-case-sensitive."
> 
> "Please format the curl commands to be ready to use in CMD/PowerShell/Linux directly."
> 
> ## Backend test prompts
> "Please generate the corresponding unit tests for the controller and service classes we generated previously."
> Consider using MockMVC or Mockito for these tests. 
> Include report generation for the test coverage of these tests. 
> Don't forget to give me the corresponding dependencies we need for this for our build.gradle file."
> 
> ## Front end prompts
> " Now that we have a working backend (Runs locally in `localhost:8080`), please build the React frontend for it. 
> Use TypeScript for this. 
> The endpoint we're using for this is 'POST /api/v1/calculate' with the following JSON body 
> '{ "operation": "ADD", "a": 0.1, "b": 0.2 }'.
> The operations we have are 'ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE', 'POWER', 'PERCENTAGE', 'SQRT', where 'a' is
> always required, and 'b' is required for every operation except 'SQRT'."
> 
> "Make the UI look similar to Windows' Calculator and make it responsive down to about 360px wide.
> Use the fonts and colors you consider user-friendly and easy to the eye."
> 
> "Pick whatever is standard for a React + TypeScript project today, and keep the setup as small as possible.
> Focus on checking that valid numbers are accepted, and empty input, letters and numbers that aretoo big are rejected
> with a clear message. Focus also on the integration with the backend, but don't call the real backend when testing.
> Include report generation for the test coverage of these tests."> 