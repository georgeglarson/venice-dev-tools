/**
 * Structured Output - JSON Schema responses
 *
 * This example demonstrates how to get structured JSON output
 * from Venice AI's chat completions using response_format with
 * JSON Schema.
 *
 * Features:
 * - Using response_format with json_schema type
 * - Defining output schemas with JSON Schema
 * - Parsing and validating structured responses
 * - Comparison with json_object mode
 *
 * Prerequisites:
 * - VENICE_API_KEY environment variable set
 *
 * Run with: npx tsx examples/typescript/21-structured-output.ts
 */

import { VeniceAI } from '@venice-dev-tools/core';
import { ensureChatCompletionResponse } from './utils';
import { requireEnv } from './env-config';

async function main() {
  const apiKey = requireEnv('VENICE_API_KEY');
  const venice = new VeniceAI({ apiKey });

  console.log('📋 Structured Output Demo\n');

  // Example 1: JSON Schema for a person object
  console.log('👤 Example 1: Person Schema');
  console.log('═'.repeat(50));

  try {
    const rawPersonResponse = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        {
          role: 'user',
          content: 'Generate a fictional person profile for a software engineer from Portland.',
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'person',
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
              occupation: { type: 'string' },
              city: { type: 'string' },
              skills: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['name', 'age', 'occupation', 'city'],
          },
        },
      } as any,
    });
    const personResponse = ensureChatCompletionResponse(rawPersonResponse, 'Person schema example');

    const content = personResponse.choices[0].message.content;
    const rawText = typeof content === 'string' ? content : JSON.stringify(content);
    console.log('📝 Raw response:', rawText);

    // Parse and display the structured data
    try {
      const person = JSON.parse(rawText);
      console.log('\n✅ Parsed structured data:');
      console.log(`   Name:       ${person.name}`);
      console.log(`   Age:        ${person.age}`);
      console.log(`   Occupation: ${person.occupation}`);
      console.log(`   City:       ${person.city}`);
      if (person.skills) {
        console.log(`   Skills:     ${person.skills.join(', ')}`);
      }
    } catch (parseError) {
      console.log('⚠️  Response was not valid JSON:', rawText);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  // Example 2: More complex schema - list of items
  console.log('\n\n📚 Example 2: Complex Schema (Book List)');
  console.log('═'.repeat(50));

  try {
    const rawBooksResponse = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        {
          role: 'user',
          content: 'List 3 classic science fiction books with their details.',
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'book_list',
          schema: {
            type: 'object',
            properties: {
              books: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    author: { type: 'string' },
                    year: { type: 'number' },
                    summary: { type: 'string' },
                  },
                  required: ['title', 'author', 'year', 'summary'],
                },
              },
            },
            required: ['books'],
          },
        },
      } as any,
    });
    const booksResponse = ensureChatCompletionResponse(rawBooksResponse, 'Book list schema example');

    const booksContent = booksResponse.choices[0].message.content;
    const booksRaw = typeof booksContent === 'string' ? booksContent : JSON.stringify(booksContent);

    try {
      const data = JSON.parse(booksRaw);
      console.log('✅ Parsed book list:\n');

      if (data.books && Array.isArray(data.books)) {
        for (const book of data.books) {
          console.log(`   📖 "${book.title}" by ${book.author} (${book.year})`);
          console.log(`      ${book.summary}\n`);
        }
      }
    } catch (parseError) {
      console.log('⚠️  Response was not valid JSON:', booksRaw);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  // Example 3: Simple json_object mode
  console.log('\n📦 Example 3: Simple JSON Object Mode');
  console.log('═'.repeat(50));

  try {
    const rawJsonResponse = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        {
          role: 'system',
          content: 'You always respond with valid JSON objects.',
        },
        {
          role: 'user',
          content: 'Give me the RGB values for the colors red, green, and blue as a JSON object.',
        },
      ],
      response_format: { type: 'json_object' } as any,
    });
    const jsonResponse = ensureChatCompletionResponse(rawJsonResponse, 'JSON object mode example');

    const jsonContent = jsonResponse.choices[0].message.content;
    const jsonRaw = typeof jsonContent === 'string' ? jsonContent : JSON.stringify(jsonContent);

    try {
      const colors = JSON.parse(jsonRaw);
      console.log('✅ Parsed JSON object:');
      console.log(JSON.stringify(colors, null, 2));
    } catch (parseError) {
      console.log('⚠️  Response was not valid JSON:', jsonRaw);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  // Summary
  console.log('\n💡 Structured Output Tips:');
  console.log('   • Use json_schema for strict schema enforcement');
  console.log('   • Use json_object for general JSON responses');
  console.log('   • Always wrap JSON.parse in try/catch for safety');
  console.log('   • Include required fields in your schema for reliability');
  console.log('   • Keep schemas simple — deeply nested schemas may reduce quality');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
