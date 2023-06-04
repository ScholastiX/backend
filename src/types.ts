import z from "zod";

export const SortBy = z.enum([ "pupils", "oce_rank", "distance" ]);

export namespace Filter {
  export const Input = z.object({
    pagination: z.object({
      size: z.number().int().min(1).max(50).default(30),
      offset: z.number().int().min(0).default(0),
    }).default({ size: 30, offset: 0 }),
    targetLocation: z.object({
      lat: z.number(),
      lon: z.number(),
    }).optional(),
    direction: z.enum(["asc", "desc"]).default("desc"),
    sortBy: SortBy.default("oce_rank"),
  });
}

export namespace Profession {
  export const ListCount = z.number().min(0).max(500).default(100);

  export const SearchText = z.object({
    value: z.string().min(2),
    limit: z.number().min(1).max(100).default(15),
  });
}
