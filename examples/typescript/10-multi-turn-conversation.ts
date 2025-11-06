/**
 * Multi-Turn Conversation - Maintain conversation context
 * 
 * This example demonstrates how to build a chatbot that
 * remembers previous messages in a conversation.
 * 
 * Features:
 * - Conversation history management
 * - Context-aware responses
 * - System prompts for behavior control
 * 
 * Run with: npx tsx examples/typescript/10-multi-turn-conversation.ts
 */

import { VeniceAI } from '@venice-dev-tools/core';
import * as readline from 'readline';

// Conversation state
interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function main() {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    console.error('❌ VENICE_API_KEY not set');
    process.exit(1);
  }

  const venice = new VeniceAI({ apiKey });

  // Initialize conversation with a system prompt
  const conversation: ConversationMessage[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant. Be concise and friendly. Remember context from previous messages.'
    }
  ];

  console.log('💬 Multi-Turn Conversation Demo');
  console.log('═'.repeat(50));
  console.log('Type your messages and press Enter.');
  console.log('Type "exit" or "quit" to end the conversation.');
  console.log('Type "history" to see conversation history.');
  console.log('Type "clear" to reset the conversation.');
  console.log('═'.repeat(50));
  console.log('');

  // Setup readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Main conversation loop
  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      const message = input.trim();

      // Handle commands
      if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') {
        console.log('\n👋 Goodbye!');
        rl.close();
        return;
      }

      if (message.toLowerCase() === 'history') {
        console.log('\n📜 Conversation History:');
        conversation.forEach((msg, i) => {
          if (msg.role !== 'system') {
            console.log(`${i}. ${msg.role}: ${msg.content}`);
          }
        });
        console.log('');
        askQuestion();
        return;
      }

      if (message.toLowerCase() === 'clear') {
        conversation.length = 1; // Keep only system message
        console.log('\n🗑️  Conversation cleared!\n');
        askQuestion();
        return;
      }

      if (!message) {
        askQuestion();
        return;
      }

      // Add user message to conversation
      conversation.push({
        role: 'user',
        content: message,
      });

      try {
        // Get AI response with full conversation context
        const response = await venice.chat.createCompletion({
          model: 'llama-3.3-70b',
          messages: conversation,
          temperature: 0.7, // Slight creativity
        });

        const assistantMessage = response.choices[0].message.content;

        // Add assistant response to conversation
        conversation.push({
          role: 'assistant',
          content: assistantMessage,
        });

        console.log(`\n🤖 Assistant: ${assistantMessage}\n`);

        // Show conversation stats
        const messageCount = conversation.length - 1; // Exclude system message
        const tokenCount = response.usage?.total_tokens || 'unknown';
        console.log(`📊 Messages: ${messageCount} | Tokens: ${tokenCount}\n`);

      } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        // Remove the failed user message
        conversation.pop();
        console.log('');
      }

      // Continue conversation
      askQuestion();
    });
  };

  // Start the conversation
  askQuestion();
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
