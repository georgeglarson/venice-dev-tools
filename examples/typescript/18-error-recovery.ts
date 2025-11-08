import {
  VeniceAI,
  VeniceAuthError,
  VeniceRateLimitError,
  VeniceValidationError,
  VeniceNetworkError,
  VeniceError,
  RecoveryHint
} from '@venice-dev-tools/core';

function logRecoveryHints(hints: RecoveryHint[], indent: string = '   '): void {
  hints.forEach((hint, index) => {
    console.log(`${indent}${index + 1}. ${hint.description}`);
    if (hint.code) {
      console.log(`${indent}   Code: ${hint.code}`);
    }
    console.log(`${indent}   Automated: ${hint.automated ? 'Yes' : 'No'}`);
  });
}

async function errorRecoveryDemo() {
  console.log('🔧 Venice AI SDK - Error Recovery Hints Demo\n');

  console.log('1️⃣  Authentication Error with Recovery Hints\n');

  try {
    const client = new VeniceAI({
      apiKey: 'invalid_key_12345',
    });

    await client.getStandardHttpClient().get('/models');
  } catch (error: unknown) {
    if (error instanceof VeniceAuthError) {
      console.log('   ❌ Authentication Error Caught');
      console.log(`   📝 Message: ${error.message}`);
      console.log(`   🏷️  Code: ${error.code}`);
      console.log('\n   💡 Recovery Hints:');

      logRecoveryHints(error.recoveryHints, '   ');
    }
  }

  console.log('\n2️⃣  Rate Limit Error with Automatic Retry\n');

  const rateLimitError = new VeniceRateLimitError('Too many requests', 60);
  
  console.log('   ❌ Rate Limit Error');
  console.log(`   📝 Message: ${rateLimitError.message}`);
  console.log(`   ⏱️  Retry After: ${rateLimitError.retryAfter} seconds`);
  console.log(`   🏷️  Code: ${rateLimitError.code}`);
  console.log('\n   💡 Recovery Hints:');
  
  rateLimitError.recoveryHints.forEach((hint, index) => {
    console.log(`\n   ${index + 1}. ${hint.description}`);
    if (hint.automated) {
      console.log('      ✅ Can be automated');
    }
    if (hint.code && index === 0) {
      console.log(`      Code: ${hint.code}`);
    }
  });

  console.log('\n3️⃣  Validation Error with Field Details\n');

  const validationError = new VeniceValidationError(
    'Invalid request parameters',
    {
      model: 'Model is required',
      max_tokens: 'Must be between 1 and 4096',
      temperature: 'Must be between 0 and 2',
    }
  );

  console.log('   ❌ Validation Error');
  console.log(`   📝 Message: ${validationError.message}`);
  console.log(`   🏷️  Code: ${validationError.code}`);
  console.log('\n   🔍 Field Errors:');
  
  if (validationError.details) {
    Object.entries(validationError.details).forEach(([field, error]) => {
      console.log(`      - ${field}: ${error}`);
    });
  }

  console.log('\n   💡 Recovery Hints:');
  logRecoveryHints(validationError.recoveryHints, '   ');

  console.log('\n4️⃣  Network Error with Retry Strategy\n');

  const networkError = new VeniceNetworkError('Connection timeout');
  
  console.log('   ❌ Network Error');
  console.log(`   📝 Message: ${networkError.message}`);
  console.log(`   🏷️  Code: ${networkError.code}`);
  console.log('\n   💡 Recovery Hints:');
  
  networkError.recoveryHints.forEach((hint, index) => {
    console.log(`\n   ${index + 1}. ${hint.description}`);
    if (hint.automated) {
      console.log('      ✅ Can be automated');
    }
  });

  console.log('\n5️⃣  Error JSON Serialization\n');

  console.log('   📦 Error as JSON:');
  console.log(JSON.stringify(rateLimitError.toJSON(), null, 2));

  console.log('\n6️⃣  Automated Error Recovery Example\n');

  async function autoRecoverFromRateLimit(error: VeniceRateLimitError) {
    console.log('   🤖 Attempting automated recovery...');
    
    const automatedHints = error.recoveryHints.filter((h): h is RecoveryHint => h.automated === true);
    
    if (automatedHints.length > 0) {
      const hint = automatedHints[0];
      console.log(`   ⚙️  Executing: ${hint.description}`);
      
      if (error.retryAfter) {
        console.log(`   ⏳ Waiting ${error.retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, error.retryAfter! * 1000));
        console.log('   ✅ Recovery complete, ready to retry');
      }
    } else {
      console.log('   ⚠️  No automated recovery available');
    }
  }

  await autoRecoverFromRateLimit(rateLimitError);

  console.log('\n7️⃣  AI Agent-Friendly Error Processing\n');

  function processErrorForAI(error: VeniceError) {
    if (error.code && error.recoveryHints) {
      const automatedHints = error.recoveryHints.filter((h): h is RecoveryHint => h.automated === true);
      
      return {
        errorType: error.name,
        errorCode: error.code,
        message: error.message,
        canAutoRecover: automatedHints.length > 0,
        automatedActions: automatedHints.map((h) => ({
          action: h.action,
          description: h.description,
          code: h.code,
        })),
        manualActions: error.recoveryHints
          .filter((h): h is RecoveryHint => h.automated !== true)
          .map((h) => ({
            action: h.action,
            description: h.description,
          })),
        context: error.context,
      };
    }
    
    return {
      errorType: error.name || 'Unknown',
      message: error.message,
      canAutoRecover: false,
    };
  }

  console.log('   🤖 Structured error for AI agent:');
  console.log(JSON.stringify(processErrorForAI(rateLimitError), null, 2));

  console.log('\n8️⃣  Recovery Hint Code Execution (Simulated)\n');

  function executeRecoveryCode(hint: RecoveryHint) {
    console.log(`   ⚙️  Action: ${hint.action}`);
    console.log(`   📝 Description: ${hint.description}`);
    
    if (hint.code) {
      console.log('   💻 Generated Code:');
      console.log('   ' + hint.code.split('\n').join('\n   '));
    }
  }

  console.log('   Example 1: Rate Limit Recovery');
  executeRecoveryCode(rateLimitError.recoveryHints[1]);

  console.log('\n   Example 2: Auth Error Recovery');
  executeRecoveryCode(new VeniceAuthError('Authentication failed').recoveryHints[0]);

  console.log('\n9️⃣  Error Context Access\n');

  console.log('   📊 Rate Limit Context:');
  console.log(`   ${JSON.stringify(rateLimitError.context, null, 2)}`);

  console.log('\n   📊 Validation Context:');
  console.log(`   ${JSON.stringify(validationError.context, null, 2)}`);

  console.log('\n🔟 Complete Error Recovery Workflow\n');

  async function handleErrorWithRecovery(error: VeniceError): Promise<void> {
    console.log(`   🔍 Analyzing ${error.name}...`);
    
    if (error.recoveryHints && error.recoveryHints.length > 0) {
      console.log(`   💡 Found ${error.recoveryHints.length} recovery hints`);
      
      const automated = error.recoveryHints.filter((h): h is RecoveryHint => h.automated === true);
      const manual = error.recoveryHints.filter((h): h is RecoveryHint => h.automated !== true);
      
      if (automated.length > 0) {
        console.log(`   ✅ ${automated.length} automated recovery options`);
        console.log(`   🤖 Executing: ${automated[0].description}`);
      }
      
      if (manual.length > 0) {
        console.log(`   👤 ${manual.length} manual recovery options`);
        manual.forEach((hint: any, i: number) => {
          console.log(`      ${i + 1}. ${hint.description}`);
        });
      }
    } else {
      console.log('   ⚠️  No recovery hints available');
    }
  }

  await handleErrorWithRecovery(rateLimitError);
  console.log();
  await handleErrorWithRecovery(validationError);

  console.log('\n✨ Error Recovery Hints Demo Complete!\n');
}

errorRecoveryDemo().catch(console.error);
