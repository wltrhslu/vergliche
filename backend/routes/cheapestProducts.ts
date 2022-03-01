import { Router, Status } from "https://deno.land/x/oak@v10.4.0/mod.ts";
import { DatabaseService } from "../services/Database.ts";

const router = new Router();

export default router.get("/cheapest-products/:id", async (context) => {
	try {
		const configId = parseInt(context?.params?.id);

		if (!configId) {
			context.response.status = Status.InternalServerError;
			context.response.body = JSON.stringify({ message: "No config id provided" });
		} else {
			context.response.status = Status.OK;
			context.response.body = await DatabaseService.getCheapestProducts(configId);
		}
	} catch (error) {
		context.response.status = Status.InternalServerError;
		context.response.body = JSON.stringify(error, Object.getOwnPropertyNames(error));
		console.log(error);
	}
});
