import { Product } from "../db/Models.ts";

export class Digitec {
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

	async fetchFromDigitec(
		searchTerm: string,
		productType: number
	): Promise<void> {
		const vendorId = await Product.getVendorId("Digitec");

		let response = await (
			await fetch("https://www.digitec.ch/api/graphql", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query: this.productNumberSearchQuery,
					variables: this.getProductNumberSearchVariables(
						searchTerm,
						productType
					),
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

			data.push(
				this.parseDataAndAddToDb(vendorId, response.data.productDetails)
			);
		}
	}

	private async parseDataAndAddToDb(vendorId: number, data: any) {
		let productName = data.product.name;
		if (data.product.nameProperties)
			productName += " " + data.product.nameProperties;

		let price = Number.POSITIVE_INFINITY,
			availabilityType;
		for (const offer of data.offers) {
			if (
				!offer.canAddToBasket ||
				offer.type != "RETAIL" ||
				offer.price.amountIncl > price
			)
				continue;

			price = offer.price.amountIncl;
			availabilityType = offer.deliveryOptions?.mail?.classification;
		}

		if (!availabilityType) return;

		let vendorProductId;

		for (const specification of data.productDetails.specifications) {
			if (specification.type != "GENERALSPECIFICATION") continue;

			for (const property of specification.properties) {
				if (property.type != "MANUFACTURER") continue;

				vendorProductId =
					property.values?.[0].value == "NULL"
						? null
						: property.values?.[0].value;
			}
		}

		Product.addProduct(
			productName,
			price,
			availabilityType,
			data.productDetails.canonicalUrl,
			vendorId,
			data.product.brandName,
			"Graphics Card",
			vendorProductId,
			data.product.averageRating
		);
	}

	private getProductNumberSearchVariables(
		searchTerm: string,
		productType: number
	) {
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
