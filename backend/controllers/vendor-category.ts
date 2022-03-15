import { Category, Vendor, Vendor_Category } from "../db/Models.ts";

export default {
	async getAllVendorCategories() {
		const data = await Vendor_Category.join(Vendor, Vendor.field("id"), Vendor_Category.field("vendor_id")).get();
		return data;
	},
};
