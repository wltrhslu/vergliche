import { Router, Status } from "https://deno.land/x/oak/mod.ts";
import configController from "../controllers/config.ts";

const router = new Router();

router
	.get("/config", async (context) => {
		try {
			const configs = await configController.getAllConfigs();
			context.response.body = { length: configs.length, data: configs };
			context.response.type = "json";
			context.response.status = Status.OK;
		} catch (error) {
			context.response.status = 500;
			context.response.body = JSON.stringify(
				error,
				Object.getOwnPropertyNames(error)
			);
			console.log(error);
		}
	})
	.post("/config", async (context) => {
		try {
			await configController.createConfig(
				(await context.request.body().value) as IConfig
			);
			context.response.status = 200;
		} catch (error) {
			context.response.status = 500;
			context.response.body = error.message;
		}
	});

export default router;
