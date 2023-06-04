import { Client } from "pg";
import queries from "./queries";
import config from "../../config.json";

export let client: Client;
export let connected = false;

export async function connect() {
  if (connected) {
    return;
  }

  client = new Client({
    user: "root",
    password: "root",
    host: config.postgresHost,
    port: 5432,
    database: "root"
  });

  await client.connect();

  await Promise.all(queries.map(q => client.query(q)));

  connected = true;
}
