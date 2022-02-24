import { Router, Status } from "https://deno.land/x/oak/mod.ts";
import categoryController from "../controllers/category.ts";

const router = new Router();

router.get("/category", async (context) => {
	try {
		const categories = await categoryController.getAllCategories();
		context.response.body = categories;
		context.response.type = "json";
		context.response.status = Status.OK;
	} catch (error) {
		context.response.status = 500;
		context.response.body = JSON.stringify(error, Object.getOwnPropertyNames(error));
		console.log(error);
	}
});

export default router;
