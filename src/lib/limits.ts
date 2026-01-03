export const MAX_RECIPES_PER_USER = 10;
export const MAX_LISTS_PER_USER = 10;
export const MAX_LIST_ITEMS_PER_LIST = 50;
export const MAX_API_BODY_BYTES = 256 * 1024;
export const RATE_LIMIT_MAX = 60;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export class LimitError extends Error {
  readonly status = 403;

  constructor(message: string) {
    super(message);
    this.name = "LimitError";
  }
}
