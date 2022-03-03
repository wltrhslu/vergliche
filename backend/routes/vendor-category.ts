import { Router, Status } from "https://deno.land/x/oak@v10.4.0/mod.ts";
import vendorCategoryController from "../controllers/vendor-category.ts";

const router = new Router();

router.get("/vendor-category", async (context) => {
	try {
		const vendors = await vendorCategoryController.getAllVendorCategories();
		context.response.body = { length: vendors.length, data: vendors };
		context.response.type = "json";
		context.response.status = Status.OK;
	} catch (error) {
		context.response.status = 500;
		context.response.body = JSON.stringify(error, Object.getOwnPropertyNames(error));
		console.log(error);
	}
});

export default router;
