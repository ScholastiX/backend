import type { Response } from "express";
import statusCodes from "./statusCodes";

const statusResponse = (code: keyof typeof statusCodes, message?: string):
  { code: number, status: string, message?: string } => ({
  code,
  status: statusCodes[code],
  ...(message ? { message } : {}),
});

export function generateStatus(res: Response, code: keyof typeof statusCodes, message?: string) {
  res.status(code).json(statusResponse(code, message));
}
