export abstract class ErrorWithResponse extends Error {
  constructor(
    public message: string,
    public responseExtras?: ResponseInit,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.responseExtras = responseExtras || {};
  }

  toResponse() {
    return new Response(this.message, {
      status: this.responseExtras?.status || 500,
      ...this.responseExtras,
    });
  }
}

export class RateLimitError extends ErrorWithResponse {
  constructor(used: number) {
    super(`You have reached the daily message limit (${used - 1})`, {
      status: 429,
      headers: {
        "Retry-After": "86400", // 24 hours
      },
    });
  }
}

export class UnauthorizedError extends ErrorWithResponse {
  constructor() {
    super("Unauthorized", {
      status: 401,
    });
  }
}

export class InternalServerError extends ErrorWithResponse {
  constructor(message?: string) {
    super(message || "An unexpected internal error occurred", {
      status: 500,
    });
  }
}

export class BadRequestError extends ErrorWithResponse {
  constructor(message?: string) {
    super(message || "Invalid request", {
      status: 400,
    });
  }
}
