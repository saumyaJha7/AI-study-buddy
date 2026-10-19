import { app } from "./app.js";
import { env } from "./env.js";

app.listen(env.port, () => {
  console.log(`[api] listening on http://192.168.1.38:${env.port}`);
});
