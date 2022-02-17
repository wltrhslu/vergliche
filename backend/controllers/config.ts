import { Config } from "../db/Models.ts";

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
	},

	async getAllConfigs() {
		return await Config.all();
	},
};
