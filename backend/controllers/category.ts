import { Category } from "../db/Models.ts";

export default {
	async getAllCategories() {
		const fields = ["id", "name"];
		return await Category.select(...fields).all();
	},
};
