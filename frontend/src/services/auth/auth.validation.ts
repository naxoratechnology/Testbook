import { ValidationError } from 'yup';

export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ValidationError)) return {};
  const messages: Record<string, string> = {};
  for (const issue of error.inner.length ? error.inner : [error]) {
    if (issue.path && !messages[issue.path]) messages[issue.path] = issue.message;
  }
  return messages;
}
