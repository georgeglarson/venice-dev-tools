/**
 * Function Calling - Tool use with chat completions
 *
 * This example demonstrates how to use function/tool calling
 * with Venice AI's chat completions API.
 *
 * Features:
 * - Defining function tools with JSON Schema
 * - Automatic tool choice by the model
 * - Parsing tool_calls from assistant responses
 * - Sending tool results back with role: 'tool'
 * - Multi-turn conversation with tool use
 *
 * Prerequisites:
 * - VENICE_API_KEY environment variable set
 *
 * Run with: npx tsx examples/typescript/20-function-calling.ts
 */

import { VeniceAI } from '@venice-dev-tools/core';
import { ensureChatCompletionResponse } from './utils';
import { requireEnv } from './env-config';

// Simulated weather database
function getWeather(location: string, unit: string = 'fahrenheit'): string {
  const weatherData: Record<string, { temp_f: number; temp_c: number; condition: string }> = {
    'san francisco': { temp_f: 62, temp_c: 17, condition: 'foggy' },
    'new york': { temp_f: 78, temp_c: 26, condition: 'sunny' },
    'london': { temp_f: 59, temp_c: 15, condition: 'rainy' },
    'tokyo': { temp_f: 85, temp_c: 29, condition: 'humid' },
  };

  const key = location.toLowerCase();
  const data = weatherData[key];
  if (!data) {
    return JSON.stringify({ error: `No weather data available for "${location}"` });
  }

  const temp = unit === 'celsius' ? data.temp_c : data.temp_f;
  const unitLabel = unit === 'celsius' ? 'C' : 'F';
  return JSON.stringify({
    location,
    temperature: temp,
    unit: unitLabel,
    condition: data.condition,
  });
}

// Define the tool for the model
const weatherTool = {
  type: 'function' as const,
  function: {
    name: 'get_weather',
    description: 'Get the current weather for a given location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city name, e.g. "San Francisco"',
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'Temperature unit (default: fahrenheit)',
        },
      },
      required: ['location'],
    },
  },
};

async function main() {
  const apiKey = requireEnv('VENICE_API_KEY');
  const venice = new VeniceAI({ apiKey });

  console.log('🔧 Function Calling Demo\n');

  // Step 1: Send a message that should trigger tool use
  console.log('📤 Step 1: Sending user message with tools defined');
  console.log('═'.repeat(50));

  const messages: any[] = [
    {
      role: 'user',
      content: 'What is the weather like in San Francisco and Tokyo?',
    },
  ];

  try {
    const rawResponse = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages,
      tools: [weatherTool],
      tool_choice: 'auto',
    });
    const response = ensureChatCompletionResponse(rawResponse, 'Function calling step 1');

    const assistantMessage = response.choices[0].message;
    console.log('✅ Model response received');

    // Check if the model wants to call tools
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log(`🔧 Model requested ${assistantMessage.tool_calls.length} tool call(s):\n`);

      // Add the assistant message (with tool_calls) to conversation
      messages.push(assistantMessage);

      // Step 2: Execute each tool call and send results back
      console.log('📤 Step 2: Executing tool calls and sending results');
      console.log('═'.repeat(50));

      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        console.log(`  📌 Calling: ${functionName}(${JSON.stringify(args)})`);

        let result: string;
        if (functionName === 'get_weather') {
          result = getWeather(args.location, args.unit);
        } else {
          result = JSON.stringify({ error: `Unknown function: ${functionName}` });
        }

        console.log(`  📋 Result: ${result}\n`);

        // Add the tool result to the conversation
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result,
        });
      }

      // Step 3: Get the final response with tool results
      console.log('📤 Step 3: Getting final response with tool results');
      console.log('═'.repeat(50));

      const rawFinalResponse = await venice.chat.completions.create({
        model: 'llama-3.3-70b',
        messages,
        tools: [weatherTool],
      });
      const finalResponse = ensureChatCompletionResponse(rawFinalResponse, 'Function calling step 3');

      const finalContent = finalResponse.choices[0].message.content;
      console.log('✅ Final response:');
      console.log(typeof finalContent === 'string' ? finalContent : JSON.stringify(finalContent));
    } else {
      // Model responded directly without tool calls
      console.log('ℹ️  Model responded without using tools:');
      const content = assistantMessage.content;
      console.log(typeof content === 'string' ? content : JSON.stringify(content));
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  // Summary
  console.log('\n💡 Function Calling Tips:');
  console.log('   • Define tools with clear descriptions and JSON Schema parameters');
  console.log('   • Use tool_choice: "auto" to let the model decide when to call tools');
  console.log('   • Use tool_choice: "required" to force tool use');
  console.log('   • Always include tool_call_id when sending tool results back');
  console.log('   • The model can request multiple tool calls in a single response');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
