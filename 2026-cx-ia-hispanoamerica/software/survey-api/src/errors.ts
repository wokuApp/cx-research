export class DomainError extends Error {
  constructor(public readonly code: string, public readonly status: number = 409) { super(code); }
}
