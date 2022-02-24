import { Database, MySQLConnector } from "https://deno.land/x/denodb/mod.ts";
import { Vendor, Brand, Category, Vendor_Category, Config, Product, CheapestProduct } from "../db/Models.ts";
import { IConfig, IProduct } from "../interfaces/database.ts";

export class DatabaseService {
	private db: Database;

	constructor(private databaseName: string, private host: string, private username: string, private password: string) {
		const connector = new MySQLConnector({
			database: this.databaseName,
			host: this.host,
			username: this.username,
			password: this.password,
		});

		this.db = new Database(connector);

		this.db.link([Vendor, Brand, Category, Vendor_Category, Config, Product, CheapestProduct]);
	}

	async initDatabase() {
		// await this.db.sync();
		if (!(await Vendor.count())) {
			await Vendor.addVendors();
		}
		if (!(await Category.count())) {
			await Category.addProductCategory();
		}
	}

	static async getVendorId(vendorName: string): Promise<number> {
		const vendorId = (await Vendor.select("id").where("name", vendorName).get()) as any;

		if (vendorId.length != 1) throw new RangeError("either no or multiple vendors found");

		return vendorId[0].id;
	}

	static async getBrandId(brandName: string): Promise<number> {
		const brandId = (await Brand.select("id").where("name", brandName).get()) as any;

		if (brandId.length > 1) throw new RangeError("Mutiple brands found");
		if (!brandId.length) {
			return (await Brand.create({ name: brandName })).lastInsertId as number;
		}

		return brandId[0].id;
	}

	static async getCategoryId(categoryName: string): Promise<number> {
		const category = (await Category.select("id").where("name", categoryName).get()) as any;

		if (category.length != 1) throw new RangeError("either no or multiple product categorys found");

		return category[0].id;
	}

	static async getVendorCategoryIdentifier(vendorId: number, categoryId: number): Promise<string> {
		const vendorCategories = (await Vendor_Category.select("vendor_category_identifier", "category_id")
			.where("vendor_id", vendorId)
			.get()) as unknown as [{ vendor_category_identifier: string; categoryId: number }];

		const vendorCategoriesFiltered = vendorCategories.filter(
			(vendorCategory) => vendorCategory.categoryId == categoryId
		);

		if (!vendorCategoriesFiltered.length || vendorCategoriesFiltered.length > 1)
			throw new RangeError("either no or multiple vendor categorys found");

		return vendorCategoriesFiltered[0].vendor_category_identifier;
	}

	static async getSearchFrequency(configId: number) {
		return (await Config.select("search_frequency").find(configId)).search_frequency as string;
	}

	static async getConfig(configId: number) {
		return (await Config.find(configId)) as unknown as IConfig;
	}

	static async addOrUpdateProduct(product: IProduct) {
		//fuzzymatching for the product, since sometimes the manufacturer_number is the same for different products or not provided
		let similarProducts = (await Product.where("brand_id", product.brand_id).get()) as any;

		similarProducts = similarProducts.filter((similarProduct: any) => {
			if (similarProduct.configId !== product.config_id) return false;
			if (similarProduct.name == product.name) return true;
			return false;
		}) as IProduct[];

		if (similarProducts.length > 1) throw new RangeError("To many products match new product");
		else if (similarProducts.length) {
			const id = similarProducts[0].id;
			Product.where("id", id).update({ price: product.price, availability: product.availability, url: product.url });
			return;
		}

		await Product.create([
			{
				name: product.name,
				price: product.price,
				availability: product.availability,
				url: product.url,
				vendor_id: product.vendor_id,
				rating: product.rating ?? null,
				manufacturer_number: product.manufacturer_number ?? null,
				brand_id: product.brand_id,
				category_id: product.categoryId,
				config_id: product.config_id,
			},
		]);
	}

	static async setCheapestProduct(configId: number) {
		const products = (await Product.where("config_id", configId)
			.orderBy("price")
			.select("id", "price")
			.get()) as unknown as [{ id: number; price: number }];

		if (!products.length) throw new RangeError(`No Products found with configId: ${configId}`);

		const cheapestProductId = products
			.filter((product) => Math.floor(product.price) !== 0)
			.reduce((previous, current) => (previous.price < current.price ? previous : current)).id;

		await CheapestProduct.create({
			config_id: configId,
			product_id: cheapestProductId,
		});
	}
}
