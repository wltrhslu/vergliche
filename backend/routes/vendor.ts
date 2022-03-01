import { Router, Status } from "https://deno.land/x/oak@v10.4.0/mod.ts";
import vendorController from "../controllers/vendor.ts";

const router = new Router();

router.get("/vendor", async (context) => {
	try {
		const vendors = await vendorController.getAllVendors();
		context.response.body = { length: vendors.length, data: vendors };
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
});

export default router;
