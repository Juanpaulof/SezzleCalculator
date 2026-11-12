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