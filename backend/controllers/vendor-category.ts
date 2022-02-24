import { Category, Vendor, Vendor_Category } from "../db/Models.ts";

export default {
	async getAllVendorCategories() {
		const data = await Vendor_Category.join(
			Vendor,
			Vendor.field("id"),
			Vendor_Category.field("vendor_id")
		).get();
		return data;
	},
};

//Given this example with denodb:
// `const data = await Vendor_Category.where(
//     "vendor_id",
//     category.id as number
// ).get();`

// the type of data is:
// `const data: Model | Model[]`

// Then, if you want to check the length of data (or use any array method):
// `if (data.length > 1) { }`
// the "Object is possibly 'null'.deno-ts(2531)" error is produced, which makes sense because data can be null.

// But:
// `if (data.length) { }//no error
// if (data?.length) { }//no error
// if (data!.length) { }// no error
// if (data?.length > 1) { } //Object is possibly 'null'.deno-ts(2531)
// if (data!.length > 1) { } //Object is possibly 'null'.deno-ts(2531)`
