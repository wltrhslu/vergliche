import { DatabaseService } from "./services/Database.ts";

const db = new DatabaseService("vergliche", "wltr.internet-box.ch", "root", "Welcome01");
await db.initDatabase();

import { Application, Router, send } from "https://deno.land/x/oak@v10.4.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import categoryRouter from "./routes/category.ts";
import ConfigRouter from "./routes/config.ts";
import vendorRouter from "./routes/vendor.ts";
import vendorCategoryRouter from "./routes/vendor-category.ts";
import ServerSentEventRouter from "./routes/sse.ts";
import cheapestProducts from "./routes/cheapestProducts.ts";
import SearchService from "./services/search.ts";

const port = 8080;
const app = new Application();
const router = new Router();
let cwd = Deno.cwd();
console.log(cwd);
cwd = cwd.substring(0, cwd.lastIndexOf("\\") + 1);
console.log(cwd);

router.get("/", async (context) => {
	const body = await Deno.readTextFile(`${cwd}/frontend/build/index.html`);
	context.response.body = body;
});

router.get("/static/:path+", async (context) => {
	await send(context, context.request.url.pathname, {
		root: `${cwd}/frontend/build`,
	});
});

const searchService = new SearchService();
await searchService.registerAllConfigs();

const configRouter = new ConfigRouter(searchService);
const serverSentEventRouter = new ServerSentEventRouter(searchService);

app.use(oakCors({ credentials: true, origin: "http://localhost:3000" }));
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
app.use(cheapestProducts.allowedMethods());
app.use(cheapestProducts.routes());

app.addEventListener("listen", () => {
	console.log(`Listening on localhost:${port}`);
});

await app.listen({ port });
