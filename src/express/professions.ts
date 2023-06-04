import { postgresClient } from "../postgres";
import { Profession } from "../types";
import { expressApp } from "./client";
import type { Request, Response } from "express";

async function professionList(req: Request, res: Response) {
  const count = Profession.ListCount.parse(req.query.count);

  const { rows } = await postgresClient.query(
        `SELECT name, description FROM professions ORDER BY random() LIMIT $1`,
        [ count ],
  );

  return res.json(rows);
}

async function professionSearch(req: Request, res: Response) {
  const { value, limit } = Profession.SearchText.parse(req.query);

  const { rows } = await postgresClient.query(
        `SELECT name FROM professions WHERE name IS NOT NULL ORDER BY similarity(name, $1) DESC LIMIT $2`,
        [ value, limit ]
  );

  return res.json(rows.map(v => v.name));
}

export default function () {
  expressApp.get("/professions", professionList);
  expressApp.get("/professions/search", professionSearch);
}
