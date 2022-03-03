import { Router, Status } from "https://deno.land/x/oak@v10.4.0/mod.ts";
import configController from "../controllers/config.ts";
import SearchService from "../services/search.ts";

export default class ConfigRouter {
	router = new Router();
	searchService: SearchService;

	constructor(searchService: SearchService) {
		this.searchService = searchService;

		configController.setSearchService(searchService);

		this.initRouter();
	}

	initRouter() {
		this.router
			.get("/config", async (context) => {
				try {
					const configs = await configController.getConfig(null);
					context.response.body = configs;
					context.response.type = "json";
					context.response.status = Status.OK;
				} catch (error) {
					context.response.status = Status.InternalServerError;
					context.response.body = JSON.stringify(error, Object.getOwnPropertyNames(error));
				}
			})
			.get("/config/:id", async (context) => {
				try {
					const config = await configController.getConfig(context?.params?.id);
					context.response.body = config;
					context.response.type = "json";
					context.response.status = Status.OK;
				} catch (error) {
					context.response.status = Status.InternalServerError;
					context.response.body = JSON.stringify(error, Object.getOwnPropertyNames(error));
				}
			})
			.post("/config", async (context) => {
				try {
					const configs = await configController.createConfig((await context.request.body().value) as IConfig);
					context.response.status = Status.OK;
					context.response.type = "json";
					context.response.body = configs;
				} catch (error) {
					context.response.status = Status.InternalServerError;
					context.response.body = error.message;
				}
			})
			.put("/config", async (context) => {
				try {
					const configs = await configController.updateConfig((await context.request.body().value) as IConfig);
					context.response.status = Status.OK;
					context.response.type = "json";
					context.response.body = configs;
				} catch (error) {
					context.response.status = Status.InternalServerError;
					context.response.body = error.message;
				}
			});
	}

	getRouter() {
		return this.router;
	}
}
