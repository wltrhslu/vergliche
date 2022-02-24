import { Router, Status } from "https://deno.land/x/oak/mod.ts";
import SearchService from "../services/search.ts";

export default class ServerSentEventRouter {
	router = new Router();

	constructor(public searchService: SearchService) {
		this.initRouter();
	}

	initRouter() {
		this.router.get("/sse/:id", (context) => {
			const configId = parseInt(context?.params?.id);

			if (!configId) {
				context.response.status = Status.InternalServerError;
				context.response.body = JSON.stringify({ message: "No config id provided" });
			} else {
				const target = context.sendEvents();
				this.searchService.addSseTarget(configId, target);

				target.addEventListener("close", () => {
					this.searchService.removeSseTarget(target);
				});
			}
			// 	context.response.body = config;
			// 	context.response.type = "json";
			// 	context.response.status = Status.OK;
			// } catch (error) {
			// 	context.response.status = Status.InternalServerError;
			// 	context.response.body = JSON.stringify(error, Object.getOwnPropertyNames(error));
		});
	}

	getRouter() {
		return this.router;
	}
}
