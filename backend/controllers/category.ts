import { Category } from "../db/Models.ts";

export default {
	async getAllCategories() {
		return (await Category.all()).map((category) => {
			return {
				id: category.id,
				name: category.name,
			};
		});
	},
};
