import { VeniceClient } from '@venice/core';
import {
  loggingMiddleware,
  timingMiddleware,
  headersMiddleware,
  requestIdMiddleware,
  Middleware,
} from '@venice/core/middleware';

async function middlewareDemo() {
  const client = new VeniceClient({
    apiKey: process.env.VENICE_API_KEY,
  });

  const logger = client.getLogger();

  console.log('🔧 Venice AI SDK - Middleware System Demo\n');

  console.log('1️⃣  Built-in Middleware Examples\n');

  console.log('   Adding timing middleware...');
  client.use(timingMiddleware());

  console.log('   Adding request ID middleware...');
  client.use(requestIdMiddleware());

  console.log('   Adding custom headers middleware...');
  client.use(headersMiddleware({
    'X-Custom-Client': 'Venice-SDK-Demo',
    'X-Environment': 'development',
  }));

  console.log('   Adding logging middleware...');
  client.use(loggingMiddleware(logger, {
    logHeaders: true,
    logBody: false,
    logResponse: false,
  }));

  console.log('\n2️⃣  Custom Middleware Example\n');

  const rateLimitTrackerMiddleware: Middleware = {
    name: 'rate-limit-tracker',
    
    onResponse: (context) => {
      const remaining = context.response.headers?.['x-ratelimit-remaining'];
      const limit = context.response.headers?.['x-ratelimit-limit'];
      
      if (remaining && limit) {
        console.log(`   📊 Rate Limit: ${remaining}/${limit} requests remaining`);
      }
      
      return context;
    },
    
    onError: (context) => {
      console.error(`   ❌ Request failed after ${context.duration}ms: ${context.error.message}`);
    },
  };

  client.use(rateLimitTrackerMiddleware);

  console.log('3️⃣  Testing Middleware Pipeline\n');

  try {
    const response = await client.getStandardHttpClient().get('/models');
    console.log(`\n   ✅ Retrieved ${response.data.data?.length || 0} models`);
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
  }

  console.log('\n4️⃣  Request Transformation Middleware\n');

  const requestTransformMiddleware: Middleware = {
    name: 'request-transform',
    
    onRequest: (context) => {
      console.log(`   🔄 Transforming request to ${context.path}`);
      
      context.options.headers = context.options.headers || {};
      context.options.headers['X-Transformed'] = 'true';
      context.options.headers['X-Transform-Time'] = new Date().toISOString();
      
      context.metadata = context.metadata || {};
      context.metadata.originalPath = context.path;
      
      return context;
    },
  };

  client.use(requestTransformMiddleware);

  console.log('\n5️⃣  Response Modification Middleware\n');

  const responseEnrichmentMiddleware: Middleware = {
    name: 'response-enrichment',
    
    onResponse: (context) => {
      console.log(`   💎 Enriching response from ${context.path}`);
      
      if (context.response.data && typeof context.response.data === 'object') {
        (context.response.data as any)._metadata = {
          requestId: context.metadata?.requestId,
          duration: context.duration,
          timestamp: new Date(context.timestamp).toISOString(),
        };
      }
      
      return context;
    },
  };

  client.use(responseEnrichmentMiddleware);

  console.log('\n6️⃣  Making Request with Full Middleware Pipeline\n');

  try {
    const response = await client.getStandardHttpClient().get('/models', {
      query: { limit: 5 },
    });
    
    console.log(`\n   ✅ Response includes metadata: ${!!(response.data as any)._metadata}`);
    
    if ((response.data as any)._metadata) {
      console.log('   📦 Metadata:', JSON.stringify((response.data as any)._metadata, null, 2));
    }
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
  }

  console.log('\n7️⃣  Middleware Management\n');

  console.log('   Removing request-transform middleware...');
  const removed = client.removeMiddleware('request-transform');
  console.log(`   ${removed ? '✅' : '❌'} Middleware removed: ${removed}`);

  console.log('\n8️⃣  Advanced: Caching Middleware\n');

  const cacheStats = { hits: 0, misses: 0 };
  const cache = new Map<string, { data: any; timestamp: number }>();

  const simpleCacheMiddleware: Middleware = {
    name: 'simple-cache',
    
    onRequest: (context) => {
      const cacheKey = `${context.path}:${JSON.stringify(context.options.query || {})}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < 60000) {
        console.log(`   💾 Cache HIT for ${context.path}`);
        cacheStats.hits++;
        context.metadata = context.metadata || {};
        context.metadata.cacheHit = true;
        context.metadata.cachedData = cached.data;
      } else {
        console.log(`   🔍 Cache MISS for ${context.path}`);
        cacheStats.misses++;
      }
      
      return context;
    },
    
    onResponse: (context) => {
      if (!context.metadata?.cacheHit) {
        const cacheKey = `${context.path}:${JSON.stringify(context.options.query || {})}`;
        cache.set(cacheKey, {
          data: context.response.data,
          timestamp: Date.now(),
        });
        console.log(`   💾 Cached response for ${context.path}`);
      }
      return context;
    },
  };

  client.use(simpleCacheMiddleware);

  console.log('   Making first request (should miss cache)...');
  await client.getStandardHttpClient().get('/models', { query: { limit: 3 } });

  console.log('\n   Making second request (should hit cache)...');
  await client.getStandardHttpClient().get('/models', { query: { limit: 3 } });

  console.log(`\n   📊 Cache Stats: ${cacheStats.hits} hits, ${cacheStats.misses} misses`);

  console.log('\n✨ Middleware Demo Complete!\n');
}

middlewareDemo().catch(console.error);
