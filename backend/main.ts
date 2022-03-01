import { Digitec } from "./services/digitec.ts";
import { DatabaseService } from "./services/Database.ts";

const db = new DatabaseService("vergliche", "wltr.internet-box.ch", "root", "Welcome01");
await db.initDatabase();

import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import categoryRouter from "./routes/category.ts";
import ConfigRouter from "./routes/config.ts";
import vendorRouter from "./routes/vendor.ts";
import vendorCategoryRouter from "./routes/vendor-category.ts";
import ServerSentEventRouter from "./routes/sse.ts";
import CheapestProducts from "./routes/cheapestProducts.ts";
import SearchService from "./services/search.ts";

const port = 8080;
const app = new Application();
const router = new Router();

router.get("/", async (context) => {
	await send(context, "/", {
		root: `${Deno.cwd()}/frontend/public`,
		index: "index.html",
	});
});

const searchService = new SearchService();
const configRouter = new ConfigRouter(searchService);
const serverSentEventRouter = new ServerSentEventRouter(searchService);

app.use(oakCors());
app.use(router.allowedMethods());
app.use(router.routes());
app.use(categoryRouter.allowedMethods());
app.use(categoryRouter.routes());
app.use(serverSentEventRouter.getRouter().allowedMethods());
app.use(serverSentEventRouter.getRouter().routes());
app.use(configRouter.getRouter().allowedMethods());
app.use(configRouter.getRouter().routes());
app.use(vendorRouter.allowedMethods());
app.use(vendorRouter.routes());
app.use(vendorCategoryRouter.allowedMethods());
app.use(vendorCategoryRouter.routes());
app.use(CheapestProducts.allowedMethods());
app.use(CheapestProducts.routes());

app.addEventListener("listen", () => {
	console.log(`Listening on localhost:${port}`);
});

await app.listen({ port });
