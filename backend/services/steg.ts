import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";
import { ISearchSubService } from "../interfaces/search.ts";
import { IProduct } from "../interfaces/database.ts";
import { DatabaseService } from "./Database.ts";

export class StegElectronics implements ISearchSubService {
	availabilites: { [key: string]: string } = {
		"#228B22": "ONEDAY",
		"#9ACD32": "WITHIN4DAYS",
		"#F2C902": "WITHIN7DAYS",
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
			await (await fetch(this.getUrl(searchTerm, categoryIdentifier))).text(),
			"text/html"
		);

		const lastPage = parseInt(
			document?.getElementById("pagination")?.getElementsByTagName("div")?.[0]?.lastElementChild?.innerHTML || "1"
		);

		for (let i = 1; i <= lastPage; i++) {
			document = new DOMParser().parseFromString(
				await (await fetch(this.getUrl(searchTerm, categoryIdentifier) + `&p=${i}`)).text(),
				"text/html"
			);

			const productGridElements = document?.getElementsByClassName("productGridElement");
			if (productGridElements) {
				for (const productGridElement of productGridElements) {
					const text = productGridElement.getElementsByTagName("h2")?.[0].children[0];
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
					product.product_url = productGridElement.getElementsByClassName("listItemImage")?.[0]?.getAttribute("href");
					product.brand_id = await DatabaseService.getBrandId(text.children[0].textContent);
					product.rating =
						productGridElement.getElementsByClassName("rating")?.[0]?.getElementsByClassName("fa")?.length || null;

					product.product_name = text.innerText.replace(text.children[0].textContent, "") as string;

					if (product.product_name.includes("-"))
						product.product_name =
							product.product_name.slice(0, product.product_name.indexOf("-")).trim() +
							" " +
							product.product_name.slice(product.product_name.indexOf("-") + 1).trim();

					product.price =
						productGridElement.getElementsByClassName("generalPrice")?.[0].innerText.trim().replace("'", "") || null;

					const availabilityIcon = productGridElement.getElementsByClassName("iconShipment")?.[0]?.outerHTML;
					const color = availabilityIcon.slice(availabilityIcon.indexOf("#"), availabilityIcon.indexOf("#") + 7);
					product.availability = this.availabilites[color] || null;

					data.push(product);
				}
			}
		}

		return data;
	}

	getUrl(searchTerm: string, categoryIdentifier: string) {
		return `https://www.steg-electronics.ch/de/search?suche=${searchTerm}&categoryId=${categoryIdentifier}`;
	}
}
