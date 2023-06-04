import type { Request, Response } from "express";
import format from "pg-format";
import { postgresClient } from "../postgres";
import { queries } from "../postgres/queries";
import { Filter } from "../types";
import { expressApp } from "./client";
import { CustomError } from "./error";

async function filter(req: Request, res: Response) {
  const { sortBy, targetLocation, pagination, direction } = Filter.Input.parse(req.body || {});

  if (sortBy === "distance") {
    if (!targetLocation) {
      throw new CustomError(400, "Specify targetLocation if sorting by distance!");
    }
  }

  const { rows } = await postgresClient.query(format(
        sortBy === "distance" ? queries.filterDist : queries.filter,
        sortBy === "pupils" ? "grade_12_pupils" : sortBy,
        direction,
        pagination.offset, pagination.size,
        ...(sortBy === "distance" ? [ targetLocation?.lat, targetLocation?.lon ] : []),
  ));

  return res.json(rows);
}

export default function () {
  expressApp.post("/", filter);
}
