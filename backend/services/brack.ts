import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";
import { ISearchSubService } from "../interfaces/search.ts";
import { IProduct } from "../interfaces/database.ts";
import { DatabaseService } from "./Database.ts";

export class Brack implements ISearchSubService {
	pageSize = 24;
	availabilites: { [key: string]: string } = {
		stockLow: "ONEDAY",
		stockOk: "ONEDAY",
	};

	getServiceName() {
		return this.constructor.name;
	}

	async searchProducts(
		searchTerm: string,
		categoryIdentifier: string,
		vendorId: number,
		categoryId: number,
		configId: number
	): Promise<IProduct[]> {
		const data = new Array<IProduct>();

		const document = new DOMParser().parseFromString(
			await (await fetch(this.getUrl(searchTerm, categoryIdentifier))).text(),
			"text/html"
		);

		const productCards = document?.getElementsByClassName("product-card");
		if (productCards?.length) {
			for (const productCard of productCards) {
				const product = {} as IProduct;

				product.ignore_cheapest = 0;
				product.vendor_id = vendorId;
				product.categoryId = categoryId;
				product.config_id = configId;
				product.product_url =
					"https://brack.ch/" + productCard.getElementsByClassName("product__overlayLink")?.[0]?.getAttribute("href");
				product.brand_id = await DatabaseService.getBrandId(
					productCard.getElementsByClassName("productList__itemManufacturer")?.[0]?.textContent
				);
				product.rating =
					productCard.getElementsByClassName("ratingstars")?.[0]?.getElementsByClassName("fas").length || null;

				product.product_name = productCard
					.getElementsByClassName("productList__itemTitle")?.[0]
					?.textContent?.replace("Grafikkarte", "")
					.trim();
				if (!product.product_name.includes(searchTerm.toLowerCase())) continue;

				product.price =
					productCard.getElementsByClassName("js-currentPriceValue")?.[0]?.getAttribute("content") || null;

				const currentState = productCard.getAttribute("data-current-state") || "";
				product.availability = this.availabilites[currentState] || null;

				data.push(product);
			}
		}

		return data;
	}

	getUrl(searchTerm: string, categoryIdentifier: string) {
		return `https://www.brack.ch/${categoryIdentifier}?query=${searchTerm}`;
	}
}
