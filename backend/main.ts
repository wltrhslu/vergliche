// import { Digitec } from "./services/digitec.ts";
import { DatabaseService } from "./services/Database.ts";
const db = new DatabaseService(
	"vergliche",
	"192.168.1.11",
	"root",
	"Welcome01"
);
await db.initDatabase();

// import { StegElectronics } from "./services/steg.ts";

// const digitec = new Digitec();
// const steg = new StegElectronics();

// await digitec.fetchFromDigitec("3070", 106);
// await digitec.fetchFromDigitec("3080", 106);
// await digitec.fetchFromDigitec("3090", 106);

import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import configRouter from "./routes/config.ts";
import vendorRouter from "./routes/vendor.ts";

const port = 8080;
const app = new Application();
const router = new Router();

router.get("/", async (context) => {
	await send(context, "/", {
		root: `${Deno.cwd()}/frontend/public`,
		index: "index.html",
	});
});

app.use(oakCors());
app.use(router.allowedMethods());
app.use(router.routes());
app.use(configRouter.allowedMethods());
app.use(configRouter.routes());
app.use(vendorRouter.allowedMethods());
app.use(vendorRouter.routes());

app.addEventListener("listen", () => {
	console.log(`Listening on localhost:${port}`);
});

await app.listen({ port });
