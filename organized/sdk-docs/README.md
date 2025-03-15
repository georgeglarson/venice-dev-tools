# Venice AI SDK Documentation

This directory contains documentation and implementation plans for the Venice AI SDK.

## Implementation Plans

We've created three versions of the implementation plan with varying levels of detail to accommodate different model context window limitations:

1. **Detailed Plan**: `venice_ai_sdk_implementation_plan.md`
   - Comprehensive plan with extensive code examples
   - Best for models with large context windows (like Claude)
   - Contains complete implementation details for each improvement

2. **Compact Plan**: `venice_ai_sdk_implementation_plan_compact.md`
   - Concise version without extensive code examples
   - Suitable for models with medium context windows
   - Contains all key steps but with minimal code examples

3. **Checklist**: `venice_ai_sdk_implementation_checklist.md`
   - Minimal checklist version for quick reference
   - Suitable for models with small context windows (like Qwen 32B)
   - Contains just the essential tasks without implementation details

## Implementation Examples

We've also created individual example files in the `examples/` directory that can be used by models with limited context windows like Qwen 32B:

1. **Testing Example**: `examples/01_testing_example.md`
   - Shows how to implement unit tests for the SDK
   - Includes Jest configuration and test file examples

2. **Validation Example**: `examples/02_validation_example.md`
   - Shows how to implement input validation for API requests
   - Includes validation utility and endpoint integration examples

3. **Documentation Example**: `examples/03_documentation_example.md`
   - Shows how to add JSDoc comments and create API documentation
   - Includes examples for client and endpoint documentation

4. **Rate Limiter Example**: `examples/04_rate_limiter_example.md`
   - Shows how to implement rate limiting for API requests
   - Includes rate limiter utility and client integration examples

5. **Logging Example**: `examples/05_logging_example.md`
   - Shows how to implement logging throughout the SDK
   - Includes logger utility and integration examples

## Implementation Workflow

We've created a workflow for implementing the improvements using both Qwen and Claude:

1. **Implementation Workflow**: `implementation_workflow.md`
   - Outlines the step-by-step process for implementing improvements
   - Explains how to use Qwen and Claude together effectively
   - Provides example workflow sessions

2. **Qwen Implementation Prompt**: `qwen_implementation_prompt.md`
   - Prompt template for directing Qwen to implement specific tasks
   - Guidelines for Qwen to follow during implementation
   - Example implementation request

3. **Claude Review Prompt**: `claude_review_prompt.md`
   - Prompt template for Claude to review Qwen's implementations
   - Detailed review criteria and format
   - Example review request

## How to Use These Plans and Examples

1. **For Planning**: Use the detailed plan to understand the full scope of improvements
2. **For Implementation**:
   - Use the compact plan or checklist as a guide during implementation
   - Refer to the specific examples in the `examples/` directory when implementing each feature
   - Follow the implementation workflow described in `implementation_workflow.md`
3. **For Review**: Use the detailed plan to verify implementation quality

## Implementation Strategy

1. Use Claude for planning and reviewing complex implementations
2. Use less expensive models like Qwen 32B for straightforward implementation tasks:
   - Have Qwen load the checklist for overall guidance
   - Have Qwen load specific example files as needed for implementation details
3. Check off items in the checklist as they are completed
4. Periodically review progress against the detailed plan
5. Use the provided prompts to maintain consistent communication with both models

## Other Documentation

- `venice_ai_sdk_prd.md` - Product Requirements Document
- `venice_ai_sdk_system_design.md` - System Design Document
- `venice_ai_sdk_class_diagram.mermaid` - Class Diagram
- `venice_ai_sdk_sequence_diagram.mermaid` - Sequence Diagram
- `vision-implementation-plan.md` - Vision Implementation Plan

## Updated Versions

Some documents have updated versions available:
- `venice_ai_sdk_prd_updated.md`
- `venice_ai_sdk_system_design_updated.md`
- `venice_ai_sdk_class_diagram_updated.mermaid`
- `venice_ai_sdk_sequence_diagram_updated.mermaid`