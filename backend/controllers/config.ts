import { Config } from "../db/Models.ts";
import { IConfig } from "../interfaces/database.ts";
import SearchService from "../services/search.ts";

let searchService: SearchService;

export default {
	setSearchService(newSearchService: SearchService) {
		searchService = newSearchService;
	},

	async createConfig(config: IConfig) {
		searchService.addConfig(
			(
				(await Config.create([
					{
						search_term: config.search_term,
						search_frequency: config.search_frequency,
						selected_vendors: config.selected_vendors.join(","),
						category_id: config.category_id,
					},
				])) as unknown as { lastInsertId: number }
			).lastInsertId
		);

		return await this.getConfig(null);
	},

	async getConfig(configId: string | null) {
		const fields = ["id", "search_term", "search_frequency", "selected_vendors", "category_id"];

		if (configId) {
			const data = await Config.select(...fields).find(parseInt(configId));
			return {
				id: data.id,
				search_term: data.search_term,
				search_frequency: data.search_frequency,
				selected_vendors: (data.selected_vendors as string).split(",").map((id) => parseInt(id)),
				category_id: data.categoryId,
			};
		}

		return await Config.select(...fields).all();
	},

	async updateConfig(config: IConfig) {
		await Config.where("id", config.id).update(config);

		return await this.getConfig(null);
	},
};
