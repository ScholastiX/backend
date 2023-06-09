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
    sort: z.object({
      direction: z.enum(["asc", "desc"]).default("asc").transform(v => v.toUpperCase()),
      sortBy: SortBy.default("oce_rank"),
    }).default({}),
    filter: z.object({
      professions: z.string().array(),
      distance: z.object({
        min: z.number().min(0),
        max: z.number().min(0),
      }),
      oce: z.object({
        min: z.number().min(0).max(100),
        max: z.number().min(0).max(100),
      }),
      pupils: z.object({
        min: z.number().min(0),
        max: z.number().min(0),
      }),
    }).partial().optional()
  });
}

export namespace Profession {
  export const ListCount = z.object({
    count: z.preprocess(
          x => {
            const processed = z.string().regex(/^\d+$/).transform(Number).safeParse(x);
            return processed.success ? processed.data : x;
          },
          z.number().min(0).max(500).default(100),
    ),
  });

  export const SearchText = z.object({
    value: z.string().min(2),
    limit: z.preprocess(
          x => {
            const processed = z.string().regex(/^\d+$/).transform(Number).safeParse(x);
            return processed.success ? processed.data : x;
          },
          z.number().min(1).max(100).default(15),
    ),
  });
}

export namespace Search {
  export const SearchText = Profession.SearchText;
}
