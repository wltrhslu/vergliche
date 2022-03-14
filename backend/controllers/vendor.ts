import { Vendor } from "../db/Models.ts";

export default {
	async getAllVendors() {
		return (await Vendor.all()).map((vendor) => {
			return {
				id: vendor.id,
				vendor_name: vendor.vendor_name,
			};
		});
	},
};
