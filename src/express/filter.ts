import type { Request, Response } from "express";
import format from "pg-format";
import { postgresClient } from "../postgres";
import { queries } from "../postgres/queries";
import { Filter } from "../types";
import { expressApp } from "./client";
import { CustomError } from "./error";

const sortByMap = {
  pupils: "grade_12_pupils",
  oce_rank: "rank",
  distance: "distance",
} as const;

async function filter(req: Request, res: Response) {
  const {
    pagination,
    targetLocation,
    sort: { sortBy, direction },
    filter
  } = Filter.Input.parse(req.body || {});

  if (sortBy === "distance") {
    if (!targetLocation) {
      throw new CustomError(400, "Specify targetLocation if sorting by distance!");
    }
  }

  if (!filter) {
    const { rows } = await postgresClient.query(format(
          targetLocation ? queries.filter.plain.sortDistance : queries.filter.plain.default,
          sortByMap[sortBy], direction,
          pagination.offset, pagination.size,
          ...(targetLocation ? [ targetLocation?.lat, targetLocation?.lon ] : []),
    ));

    return res.json(rows);
  }

  const { oce, pupils, professions, distance } = filter;

  const filterQueries: string[] = [];

  if (oce) {
    filterQueries.push(format(queries.filter.filtered.oce, oce.min, oce.max));
  }
  if (pupils) {
    filterQueries.push(format(queries.filter.filtered.pupils, pupils.min, pupils.max));
  }
  if (professions) {
    filterQueries.push(format(queries.filter.filtered.professions, professions));
  }
  if (distance) {
    filterQueries.push(format(queries.filter.filtered.distance, distance.min, distance.max));
  }

  if (filterQueries.length < 1) {
    throw new CustomError(400, "Specify at least one filter!");
  }

  if (targetLocation) {
    const { rows } = await postgresClient.query(format(
          queries.filter.filtered.baseDistance,
          sortByMap[sortBy], direction,
          pagination.offset, pagination.size,
          targetLocation.lat, targetLocation.lon,
          filterQueries.join(" AND "),
    ));

    return res.json(rows);
  }

  const { rows } = await postgresClient.query(format(
        queries.filter.filtered.base,
        sortByMap[sortBy], direction,
        pagination.offset, pagination.size,
        filterQueries.join(" AND "),
  ));

  return res.json(rows);
}

export default function () {
  expressApp.post("/", filter);
}
