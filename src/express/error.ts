import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import type statusCodes from "../statusCodes";
import { generateStatus } from "../utils";
import { expressApp } from "./client";

function errorHandling(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  if (typeof err === "object" && err !== null && (err as { type: unknown }).type === "entity.parse.failed") {
    return generateStatus(res, 500, "Malformed JSON Body");
  }

  if (err instanceof CustomError) {
    return generateStatus(res, err.statusCode, err.errorMessage);
  }

  if (err instanceof ZodError) {
    return generateStatus(res, 400, JSON.parse(err.message));
  }

  console.error(err);
  return generateStatus(res, 500, typeof err === "string" ? err : undefined);
}

export class CustomError extends Error {
  statusCode: keyof typeof statusCodes;
  errorMessage: string;

  constructor(status: keyof typeof statusCodes, message: string) {
    super();
    this.statusCode = status;
    this.errorMessage = message;
  }
}

export default function () {
  expressApp.use(errorHandling);

  // Unknown paths
  expressApp.use((_req: Request, res: Response) => {
    generateStatus(res, 404);
  });
}
