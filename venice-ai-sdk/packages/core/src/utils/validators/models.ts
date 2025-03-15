import { ModelRequest } from '../../types/models';

export function validateModelRequest(request: ModelRequest): void {
  if (typeof request !== 'object' || request === null) {
    throw new Error('Invalid request: request must be an object');
  }

  if (typeof request.model !== 'string') {
    throw new Error('Invalid request: model must be a string');
  }

  if (typeof request.prompt !== 'string') {
    throw new Error('Invalid request: prompt must be a string');
  }

  if (request.max_tokens !== undefined && typeof request.max_tokens !== 'number') {
    throw new Error('Invalid request: max_tokens must be a number');
  }

  if (request.temperature !== undefined && (typeof request.temperature !== 'number' || request.temperature < 0 || request.temperature > 1)) {
    throw new Error('Invalid request: temperature must be a number between 0 and 1');
  }

  if (request.top_p !== undefined && (typeof request.top_p !== 'number' || request.top_p < 0 || request.top_p > 1)) {
    throw new Error('Invalid request: top_p must be a number between 0 and 1');
  }

  if (request.n !== undefined && typeof request.n !== 'number') {
    throw new Error('Invalid request: n must be a number');
  }

  if (request.stream !== undefined && typeof request.stream !== 'boolean') {
    throw new Error('Invalid request: stream must be a boolean');
  }

  if (request.logprobs !== undefined && typeof request.logprobs !== 'number') {
    throw new Error('Invalid request: logprobs must be a number');
  }

  if (request.echo !== undefined && typeof request.echo !== 'boolean') {
    throw new Error('Invalid request: echo must be a boolean');
  }

  if (request.stop !== undefined && (!Array.isArray(request.stop) || request.stop.some(s => typeof s !== 'string'))) {
    throw new Error('Invalid request: stop must be an array of strings');
  }

  if (request.presence_penalty !== undefined && (typeof request.presence_penalty !== 'number' || request.presence_penalty < -2 || request.presence_penalty > 2)) {
    throw new Error('Invalid request: presence_penalty must be a number between -2 and 2');
  }

  if (request.frequency_penalty !== undefined && (typeof request.frequency_penalty !== 'number' || request.frequency_penalty < -2 || request.frequency_penalty > 2)) {
    throw new Error('Invalid request: frequency_penalty must be a number between -2 and 2');
  }

  if (request.best_of !== undefined && typeof request.best_of !== 'number') {
    throw new Error('Invalid request: best_of must be a number');
  }

  if (request.logit_bias !== undefined && (typeof request.logit_bias !== 'object' || request.logit_bias === null)) {
    throw new Error('Invalid request: logit_bias must be an object');
  }

  if (request.user !== undefined && typeof request.user !== 'string') {
    throw new Error('Invalid request: user must be a string');
  }
}