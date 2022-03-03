import { Digitec } from "./digitec.ts";
// import { StegElectronics } from "./steg.ts";
import { cron } from "https://deno.land/x/deno_cron@v1.0.0/cron.ts";
import { DatabaseService } from "./Database.ts";
import { ISearchSubService } from "../interfaces/search.ts";
import { ServerSentEventTarget } from "https://deno.land/x/oak@v10.2.1/server_sent_event.ts";

export default class SearchService {
	searchServices: ISearchSubService[];
	sseTargets: { configId: number; target: ServerSentEventTarget }[];

	constructor() {
		this.searchServices = [new Digitec()];
		this.sseTargets = new Array<{ configId: number; target: ServerSentEventTarget }>();
	}

	async addConfig(configId: number) {
		const searchFrequency = await DatabaseService.getSearchFrequency(configId);
		const [h, m, _s] = searchFrequency.split(":").map((value) => parseInt(value));

		cron(`${m} */${h} * * *`, () => this.searchProducts(configId));
	}

	addSseTarget(configId: number, target: ServerSentEventTarget) {
		this.sseTargets.push({ configId, target });
	}

	async registerAllConfigs() {
		((await DatabaseService.getConfig(null)) as IConfig[]).map((config) => this.addConfig(config.id));
	}

	removeSseTarget(targetToBeRemoved: ServerSentEventTarget) {
		this.sseTargets = this.sseTargets.filter((target) => target.target !== targetToBeRemoved);
	}

	async searchProducts(configId: number) {
		const config = await DatabaseService.getConfig(configId);

		for (const service of this.searchServices) {
			const vendorId = await DatabaseService.getVendorId(service.getServiceName());
			if (!config.selected_vendors.includes(vendorId)) continue;
			const vendorCategoryIdentifier = await DatabaseService.getVendorCategoryIdentifier(vendorId, config.category_id);

			const products = await service.searchProducts(
				config.search_term,
				vendorCategoryIdentifier,
				vendorId,
				config.category_id,
				configId
			);

			for (const product of products) {
				await DatabaseService.addOrUpdateProduct(product);
			}
		}

		try {
			await DatabaseService.setCheapestProduct(configId);
		} catch (error) {
			console.log(error);
		}

		this.sseTargets
			.filter((target) => (target.configId = configId))
			.map((target) => target.target.dispatchMessage("update"));
	}
}
