import { Vendor } from "../db/Models.ts";

export default {
	async getAllVendors() {
		return await Vendor.all();
	},
};
