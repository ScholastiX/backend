import type { Request, Response } from "express";
import { postgresClient } from "../postgres";
import { Search } from "../types";
import { expressApp } from "./client";


async function facultySearch(req: Request, res: Response) {
  const { value, limit } = Search.SearchText.parse(req.query);

  const { rows } = await postgresClient.query(
        `
SELECT DISTINCT faculty_name, faculty_nr, similarity(faculty_name, $1) AS sim
FROM oce_index
WHERE faculty_name IS NOT NULL
ORDER BY sim DESC LIMIT $2`,
        [ value, limit ]
  );

  rows.forEach(v => { delete v.sim });

  return res.json(rows);
}

export default function () {
  expressApp.get("/search", facultySearch);
}
