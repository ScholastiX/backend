import { startExpress } from "./express";
import { connectPostgres } from "./postgres";

export default async function main() {
  await connectPostgres();

  await startExpress();

  console.log("Started!");
}

if (require.main === module) {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
}
