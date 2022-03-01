import { ISearchSubService } from "../interfaces/search.ts";
import { DatabaseService } from "./Database.ts";

export class Digitec implements ISearchSubService {
	private productNumberSearchQuery = `
		query ENTER_SEARCH(
			$query: String!
			$sortOrder: ProductSort
			$filters: [SearchFilter]
			$include: [String!]
			$exclude: [String!]
		) {
			search(query: $query, filters: $filters) {
				products(sortOrder: $sortOrder) {
					total
					hasMore
					nextOffset
					results {
						product{
							productId
						}
					}
				}
				filters(include: $include, exclude: $exclude) {
					product {
						identifier
						name
						filterType
						score
					}
				}
			}
		}
	`;
	private productDetailsSearchQuery = `
		query PDP_GET_PRODUCT_DETAILS($productId: Int!) {
			productDetails: productDetailsV3(productId: $productId) {
				product {
					name
					nameProperties
					brandName
					averageRating
				}
				offers {
					price {
						amountIncl
					}
					deliveryOptions {
						mail {
							classification
						}
					}
					type
					canAddToBasket
				}
				productDetails {
					canonicalUrl
					specifications {
						type
						properties {
							type
							values {
								value
							}
						}
					}
				}
			}
		}
	`;

	getServiceName() {
		return "Digitec";
	}

	async searchProducts(
		searchTerm: string,
		productType: string,
		vendorId: number,
		categoryId: number,
		configId: number
	): Promise<IProduct[]> {
		let response = await (
			await fetch("https://www.digitec.ch/api/graphql", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query: this.productNumberSearchQuery,
					variables: this.getProductNumberSearchVariables(searchTerm, productType),
				}),
			})
		).json();

		const data = [];
		for (const result of response.data.search.products.results) {
			response = await (
				await fetch("https://www.digitec.ch/api/graphql", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						query: this.productDetailsSearchQuery,
						variables: { productId: result.product.productId },
					}),
				})
			).json();

			data.push(await this.parseData(vendorId, response.data.productDetails, categoryId, configId));
		}

		return data as IProduct[];
	}

	private async parseData(vendorId: number, data: any, categoryId: number, configId: number): Promise<IProduct> {
		const product = {} as IProduct;

		product.vendor_id = vendorId;
		product.categoryId = categoryId;
		product.config_id = configId;
		product.product_url = data.productDetails.canonicalUrl;
		product.rating = data.product.averageRating || null;
		product.brand_id = await DatabaseService.getBrandId(data.product.brandName);

		product.product_name = data.product.name;
		if (data.product.nameProperties) product.product_name += " " + data.product.nameProperties;

		product.price = Number.POSITIVE_INFINITY;
		product.availability = null;

		for (const offer of data.offers) {
			if (!offer.canAddToBasket || offer.type != "RETAIL" || (product.price && offer.price.amountIncl > product.price))
				continue;

			product.price = offer.price.amountIncl;
			product.availability = offer.deliveryOptions?.mail?.classification;
		}

		if (product.price === Number.POSITIVE_INFINITY) product.price = null;

		for (const specification of data.productDetails.specifications) {
			if (specification.type != "GENERALSPECIFICATION") continue;

			for (const property of specification.properties) {
				if (property.type != "MANUFACTURER") continue;

				product.manufacturer_number = property.values?.[0].value == "NULL" ? null : property.values?.[0].value;
			}
		}

		return product;
	}

	private getProductNumberSearchVariables(searchTerm: string, productType: string) {
		return `
			{
				"query": "${searchTerm}",
				"filters": [
					{
					"identifier": "pt",
					"filterType": "TEXTUAL",
					"options": [
						"${productType}"
						]
					}
				],
				"sortOrder": null,
				"include": [
					"bra",
					"pt",
					"pr"
				],
				"exclude": [
					"off"
				]
			}
		`;
	}
}
