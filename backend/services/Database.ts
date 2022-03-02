import { Database, MySQLConnector } from "https://deno.land/x/denodb@v1.0.40/mod.ts";
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
		// await this.db.sync({ drop: true });
		if (!(await Vendor.count())) {
			await Vendor.addVendors();
		}
		if (!(await Category.count())) {
			await Category.addProductCategory();
		}
	}

	static async getVendorId(vendorName: string): Promise<number> {
		const vendorId = (await Vendor.select("id").where("vendor_name", vendorName).get()) as unknown as [{ id: number }];

		if (vendorId.length != 1) throw new RangeError("either no or multiple vendors found");

		return vendorId[0].id;
	}

	static async getBrandId(brandName: string): Promise<number> {
		const brandId = (await Brand.select("id").where("brand_name", brandName).get()) as unknown as [{ id: number }];

		if (brandId.length > 1) throw new RangeError("Mutiple brands found");
		if (!brandId.length) {
			return (await Brand.create({ brand_name: brandName })).lastInsertId as number;
		}

		return brandId[0].id;
	}

	static async getCategoryId(categoryName: string): Promise<number> {
		const category = (await Category.select("id").where("category_name", categoryName).get()) as unknown as [
			{ id: number }
		];

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

	static async getConfig(configId: number | null): Promise<IConfig | IConfig[]> {
		const fields = ["id", "search_term", "search_frequency", "selected_vendors", "category_id"];

		if (configId) {
			const data = await Config.select(...fields).find(configId);
			return {
				id: data.id,
				search_term: data.search_term,
				search_frequency: data.search_frequency,
				selected_vendors: (data.selected_vendors as string).split(",").map((id) => parseInt(id)),
				category_id: data.categoryId,
			} as IConfig;
		}

		return (await Config.select("id").all()) as IConfig[];
	}

	static async getCheapestProducts(configId: number) {
		const fields = [
			CheapestProduct.field("id"),
			CheapestProduct.field("created_at"),
			Product.field("updated_at"),
			"vendor_name",
			"brand_name",
			"rating",
			"manufacturer_number",
			"product_url",
			"availability",
			"product_name",
			"product_id",
			"price",
		];
		return await CheapestProduct.where(CheapestProduct.field("config_id"), configId)
			.join(Product, Product.field("id"), CheapestProduct.field("product_id"))
			.join(Vendor, Vendor.field("id"), Product.field("vendor_id"))
			.join(Brand, Brand.field("id"), Product.field("brand_id"))
			.select(...fields)
			.get();
	}

	static async setCheapestProduct(configId: number) {
		const products = (await Product.where("config_id", configId)
			.orderBy("price")
			.select("id", "price")
			.get()) as unknown as [{ id: number; price: number }];

		if (!products.length) throw new RangeError(`No Products found with configId: ${configId}`);

		const cheapestProductId = products
			.filter((product) => product.price !== null)
			.reduce((previous, current) => (previous.price < current.price ? previous : current)).id;

		const search_frequency = (
			(await Config.select("search_frequency").find(configId)) as unknown as { search_frequency: string }
		).search_frequency;
		const minutes = search_frequency.split(":")[1];

		const created_at = new Date();
		created_at.setMinutes(parseInt(minutes), 0, 0);

		await CheapestProduct.create({
			config_id: configId,
			product_id: cheapestProductId,
			created_at: created_at.toISOString().slice(0, 19).replace("T", " "),
		});
	}

	static async addOrUpdateProduct(product: IProduct) {
		//fuzzymatching for the product, since sometimes the manufacturer_number is the same for different products or not provided
		let similarProducts = (await Product.where("brand_id", product.brand_id).get()) as IProduct[];

		similarProducts = similarProducts.filter((similarProduct: IProduct) => {
			if (similarProduct.configId !== product.config_id) return false;
			if (similarProduct.product_name == product.product_name) return true;
			return false;
		}) as IProduct[];

		if (similarProducts.length > 1) throw new RangeError("To many products match new product");
		else if (similarProducts.length) {
			const id = similarProducts[0].id;
			Product.where("id", id).update({
				price: product.price,
				availability: product.availability,
				product_url: product.url,
			});
			return;
		}

		await Product.create([
			{
				product_name: product.product_name,
				price: product.price,
				availability: product.availability,
				product_url: product.product_url,
				vendor_id: product.vendor_id,
				rating: product.rating ?? null,
				manufacturer_number: product.manufacturer_number ?? null,
				brand_id: product.brand_id,
				category_id: product.categoryId,
				config_id: product.config_id,
			},
		]);
	}
}
