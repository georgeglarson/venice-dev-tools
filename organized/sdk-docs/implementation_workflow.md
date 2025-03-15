# Venice AI SDK Implementation Workflow

This document outlines the workflow for implementing improvements to the Venice AI SDK using a combination of Qwen and Claude.

## Workflow Overview

The implementation process uses a two-model approach:

1. **Qwen (Implementation)**: Handles the straightforward implementation tasks based on clear examples and guidelines
2. **Claude (Planning & Review)**: Provides high-level planning, handles complex reasoning, and reviews implementation quality

This approach leverages the strengths of each model while managing costs effectively.

## Step-by-Step Workflow

### 1. Initial Planning (Claude)

1. Use Claude to understand the overall architecture and improvement needs
2. Have Claude create the implementation plan and examples
3. Break down the work into discrete, manageable tasks for Qwen

### 2. Implementation (Qwen)

1. Provide Qwen with the implementation prompt (`qwen_implementation_prompt.md`)
2. Direct Qwen to focus on one specific task from the checklist
3. Have Qwen reference the relevant example file for implementation details
4. Ask Qwen to implement the task and report back with:
   - What was implemented
   - Which files were modified
   - Any challenges encountered
   - Suggested next task

### 3. Review (Claude)

1. Provide Claude with the review prompt (`claude_review_prompt.md`)
2. Share the files implemented or modified by Qwen
3. Ask Claude to review the implementation quality
4. Have Claude provide specific feedback and suggestions for improvement

### 4. Iteration

1. If Claude identifies issues, provide the feedback to Qwen
2. Have Qwen make the necessary improvements
3. Repeat the review process until the implementation meets quality standards

### 5. Progress Tracking

1. Update the implementation checklist as tasks are completed
2. Periodically review overall progress with Claude
3. Adjust the plan as needed based on progress and challenges

## Example Workflow Session

### Session 1: Planning

1. Ask Claude to analyze the Venice AI SDK and create an implementation plan
2. Claude creates:
   - Detailed implementation plan
   - Compact implementation plan
   - Implementation checklist
   - Specific examples for each improvement area

### Session 2: Initial Implementation

1. Provide Qwen with the implementation prompt and checklist
2. Ask Qwen to implement the validation utilities:
   ```
   Please implement the basic validation utilities as described in the validation example. 
   Create the `packages/core/src/utils/validation.ts` file with the validation functions shown in the example.
   ```
3. Qwen implements the validation utilities and reports back

### Session 3: Review

1. Provide Claude with the review prompt and the implemented validation utilities
2. Ask Claude to review the implementation:
   ```
   Please review the validation utilities implementation in `packages/core/src/utils/validation.ts`. 
   Qwen has implemented the basic validation functions as described in the validation example. 
   Please assess the implementation quality and provide feedback.
   ```
3. Claude provides detailed feedback on the implementation

### Session 4: Iteration

1. Share Claude's feedback with Qwen
2. Ask Qwen to address the feedback and improve the implementation
3. Qwen makes the necessary improvements and reports back

### Session 5: Next Task

1. After validation utilities are approved, move to the next task
2. Ask Qwen to implement chat validation:
   ```
   Please implement the chat validation as described in the validation example. 
   Create the `packages/core/src/utils/validators/chat.ts` file with the validation functions shown in the example.
   ```
3. Continue the implementation-review cycle

## Tips for Effective Workflow

1. **Keep tasks focused**: Ask Qwen to implement one specific file or feature at a time
2. **Provide context**: Give Qwen access to relevant examples and existing code
3. **Be specific in review requests**: Ask Claude to focus on particular aspects of the implementation
4. **Track progress**: Keep the checklist updated to maintain visibility of overall progress
5. **Maintain consistency**: Ensure coding style and patterns remain consistent throughout the implementation

By following this workflow, you can effectively leverage both models to implement high-quality improvements to the Venice AI SDK while managing costs efficiently.