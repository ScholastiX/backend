import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import registerError from "./error";
import registerFilter from "./filter";
import config from "../../config.json";
import registerProfessions from "./professions";

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
  registerProfessions();

  registerError();

  await new Promise<void>(resolve => expressApp.listen(config.expressPort, () => resolve()));

  started = true;
}
