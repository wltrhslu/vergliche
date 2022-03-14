import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";
import { ISearchSubService } from "../interfaces/search.ts";
import { IProduct } from "../interfaces/database.ts";
import { DatabaseService } from "./Database.ts";

export class Alternate implements ISearchSubService {
	availabilites = {
		"availability-5": "ONEDAY",
		"availability-16": "WITHIN4DAYS",
		"availability-19": "WITHIN7DAYS",
	} as any;

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

		let document = new DOMParser().parseFromString(
			await (await fetch(this.getUrl(searchTerm, categoryIdentifier), { credentials: "include" })).text(),
			"text/html"
		);

		console.log(document?.body.innerHTML);

		const url = this.getUrl(searchTerm, categoryIdentifier);

		const lastPage = parseInt(
			document
				?.getElementById("pagination")
				?.getElementsByClassName("current-pages")
				?.pop()
				?.getAttribute("data-page") || "1"
		);

		const test = document?.getElementById("pagination");

		for (let i = 1; i <= lastPage; i++) {
			document = new DOMParser().parseFromString(
				await (await fetch(this.getUrl(searchTerm, categoryIdentifier) + `&p=${i}`)).text(),
				"text/html"
			);

			const productGridElements = document?.getElementsByClassName("product-element");
			if (productGridElements) {
				for (const productGridElement of productGridElements) {
					const text = productGridElement.getElementsByTagName("h3")?.[0].children[0];
					if (!text.innerText.toLowerCase().includes(searchTerm.toLowerCase())) continue;

					const product = {} as IProduct;

					product.ignore_cheapest = 0;
					product.vendor_id = vendorId;
					product.categoryId = categoryId;
					product.config_id = configId;
					product.product_url = productGridElement.getElementsByClassName("link-detail")?.[0]?.getAttribute("href");
					product.brand_id = await DatabaseService.getBrandId(text.children[0].textContent);
					product.rating = null;

					product.product_name = text.innerText.replace(text.children[0].textContent, "") as string;

					if (product.product_name.toLowerCase().includes("retoure")) continue;

					if (product.product_name.includes("-"))
						product.product_name =
							product.product_name.slice(0, product.product_name.indexOf("-")).trim() +
							" " +
							product.product_name.slice(product.product_name.indexOf("-") + 1).trim();

					product.price =
						productGridElement.getElementsByClassName("price")?.[0].innerText.trim().replace("'", "") || null;

					const availabilityIcon = productGridElement.getElementsByClassName("productAvailability")?.[0];
					const availabilityClass =
						availabilityIcon.className.split(",").find((className) => className.includes("-")) || "";
					product.availability = this.availabilites[availabilityClass] || null;

					data.push(product);
				}
			}
		}

		return data;
	}

	getUrl(searchTerm: string, categoryIdentifier: string) {
		return `https://www.alternate.ch/listing.xhtml?q=${searchTerm}&filter_416=${categoryIdentifier}`;
	}
}
