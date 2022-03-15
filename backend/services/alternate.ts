import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";
import { ISearchSubService } from "../interfaces/search.ts";
import { IProduct } from "../interfaces/database.ts";
import { DatabaseService } from "./Database.ts";

export class Alternate implements ISearchSubService {
	pageSize = 24;
	availabilites: { [key: string]: string } = {
		"#009824": "ONEDAY",
		"#e4a100": "WITHIN7DAYS",
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

		let document = new DOMParser().parseFromString(
			await (await fetch(this.getUrl(searchTerm, categoryIdentifier), { credentials: "include" })).text(),
			"text/html"
		);

		const maxProducts = parseInt(
			document
				?.getElementsByClassName("shown-products-count-bottom")?.[0]
				?.parentElement?.lastChild.textContent.trim()
				.split(" ")[1] || "24"
		);

		if (maxProducts > this.pageSize)
			document = new DOMParser().parseFromString(
				await (
					await fetch(
						this.getUrl(searchTerm, categoryIdentifier) + `&lpf=${Math.floor(maxProducts / this.pageSize) + 1}`
					)
				).text(),
				"text/html"
			);

		const productBoxes = document?.getElementsByClassName("productBox");
		if (productBoxes?.length) {
			for (const productBox of productBoxes) {
				const text = productBox.getElementsByClassName("product-name")?.[0];
				if (
					!text.innerText.toLowerCase().includes(searchTerm.toLowerCase()) ||
					text.innerText.toLowerCase().includes("retoure")
				)
					continue;

				const product = {} as IProduct;

				product.ignore_cheapest = 0;
				product.vendor_id = vendorId;
				product.categoryId = categoryId;
				product.config_id = configId;
				product.product_url = productBox.getAttribute("href");
				product.brand_id = await DatabaseService.getBrandId(text.children[0].textContent);
				product.rating =
					productBox.getElementsByClassName("ratingstars")?.[0]?.getElementsByClassName("fas").length || null;

				product.product_name = text.innerText.replace(text.children[0].textContent, "") as string;

				if (product.product_name.includes("-"))
					product.product_name =
						product.product_name.slice(0, product.product_name.indexOf("-")).trim() +
						" " +
						product.product_name.slice(product.product_name.indexOf("-") + 1).trim();

				product.product_name = product.product_name.replace(", Grafikkarte", "");

				product.price =
					parseFloat(productBox.getElementsByClassName("price")?.[0].innerText.trim().split(" ")[1].replace(".", "")) +
						15 || null;

				const availabilityIcon = productBox.getElementsByClassName("delivery-info")?.[0].children[0]?.outerHTML;
				const color = availabilityIcon.slice(availabilityIcon.indexOf("#"), availabilityIcon.indexOf("#") + 7);
				product.availability = this.availabilites[color] || null;
				product.availability = this.availabilites[color] || null;

				data.push(product);
			}
		}

		return data;
	}

	getUrl(searchTerm: string, categoryIdentifier: string) {
		return `https://www.alternate.ch/listing.xhtml?q=${searchTerm}&filter_416=${categoryIdentifier}`;
	}
}
