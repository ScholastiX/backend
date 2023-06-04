import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import registerError from "./error";
import registerFilter from "./filter";

export let expressApp: Express;
let started = false;

export async function start() {
  if (started) {
    return;
  }

  expressApp = express();

  expressApp.set("trust proxy", true);

  expressApp.use(helmet());
  expressApp.use(cors({
    origin: true,
    credentials: true,
  }));
  expressApp.use(express.json());

  registerFilter();

  registerError();

  await new Promise<void>(resolve => expressApp.listen(2380, () => resolve()));

  started = true;
}
