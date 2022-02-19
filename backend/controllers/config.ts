import { Config } from "../db/Models.ts";
import { IConfig } from "../interfaces/database.ts";

export default {
	async createConfig(config: IConfig) {
		await Config.create([
			{
				search_term: config.searchTerm,
				search_frequency: config.searchFrequency,
				selected_vendors: config.selectedVendors,
				product_category_id: config.productCategoryId,
			},
		]);

		return await this.getAllConfigs();
	},

	async getAllConfigs() {
		return (await Config.all()).map((config) => {
			return {
				id: config.id,
				searchFrequency: config.search_frequency,
				searchTerm: config.search_term,
				selectedVendors: config.selected_vendors
					?.toString()
					.split(",")
					.map(Number),
				categoryId: config.categoryId,
			};
		});
	},
};
