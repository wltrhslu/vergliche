import {
	Model,
	DataTypes,
	Relationships,
} from "https://deno.land/x/denodb/mod.ts";

export class Vendor extends Model {
	static table = "vendors";
	static timestamps = true;

	static fields = {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: DataTypes.STRING,
		url: DataTypes.STRING,
	};

	static products() {
		return this.hasMany(Product);
	}

	static vendorProductCategory() {
		return this.hasMany(Vendor_Category);
	}

	static async addVendors() {
		await Vendor.create([
			{
				name: "Digitec",
				url: "https://www.digitec.ch/api/graphql",
			},
		]);
	}
}

export class Brand extends Model {
	static table = "brands";
	static timestamps = true;

	static fields = {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: DataTypes.STRING,
	};

	static product() {
		return this.hasMany(Product);
	}
}

export class Category extends Model {
	static table = "categories";
	static timestamps = true;

	static fields = {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: DataTypes.STRING,
	};

	static product() {
		return this.hasMany(Product);
	}

	static vendorProductCategory() {
		return this.hasMany(Vendor_Category);
	}

	static config() {
		return this.hasMany(Config);
	}

	static async addProductCategory() {
		await Category.create([
			{
				name: "Graphics Card",
			},
		]);
	}
}

export class Vendor_Category extends Model {
	static table = "vendor_categories";
	static timestamps = true;

	static fields = {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		vendor_category_identifier: DataTypes.TEXT,
	};

	static vendors() {
		return this.hasOne(Vendor);
	}

	static productCategory() {
		return this.hasOne(Category);
	}
}

Relationships.belongsTo(Vendor_Category, Vendor);
Relationships.belongsTo(Vendor_Category, Category);

export class Product extends Model {
	static table = "products";
	static timestamps = true;

	static fields = {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: DataTypes.TEXT,
		price: DataTypes.DECIMAL,
		availability_type: DataTypes.TEXT,
		url: DataTypes.TEXT,
		vendor_product_id: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		rating: {
			type: DataTypes.DECIMAL,
			allowNull: true,
		},
	};

	static brand() {
		return this.hasOne(Brand);
	}

	static vendor() {
		return this.hasOne(Vendor);
	}

	static category() {
		return this.hasOne(Category);
	}

	static async addProduct(
		name: string,
		price: number,
		availability_type: string,
		url: string,
		vendor_id: number,
		brandName: string,
		category: string,
		vendor_product_id?: string,
		rating?: number
	) {
		//if vendor_product_id is the same, update the price
		// if (await Product.where("vendor_product_id", vendor_product_id).count()) {
		// 	Product.where("vendor_product_id", vendor_product_id).update(
		// 		"price",
		// 		price
		// 	);
		// 	return;
		// }

		const brand_id = await this.getBrandId(brandName);
		const category_id = await this.getProductCategoryId(category);

		//because denodb doesn't offer and/or in where clauses, we have to circumvent this by
		//using a filter method on a js array to reduce database calls and do some any casting shenanigans
		let similarProducts = (await Product.where(
			"brand_id",
			brand_id
		).get()) as any;

		similarProducts = similarProducts.filter((product: any) => {
			return product.name == name && product.producttypeId == category_id;
		}) as Array<{}>;

		if (similarProducts.length) {
			const id = similarProducts[0].id;
			Product.where("id", id).update("price", price);
			return;
		}

		await Product.create([
			{
				name,
				price,
				availability_type,
				url,
				vendor_id,
				rating: rating ?? null,
				vendor_product_id: vendor_product_id ?? null,
				brand_id,
				category_id,
			},
		]);
	}

	static async getVendorId(vendorName: string): Promise<number> {
		const vendorId = (await Vendor.select("id")
			.where("name", vendorName)
			.get()) as any;

		if (vendorId.length != 1)
			throw new RangeError("either no or multiple vendors found");

		return vendorId[0].id;
	}

	static async getBrandId(brandName: string): Promise<number> {
		const brandId = (await Brand.select("id")
			.where("name", brandName)
			.get()) as any;

		if (brandId.length > 1) throw new RangeError("Mutiple brands found");
		if (!brandId.length) {
			await Brand.create({ name: brandName });
			return await this.getBrandId(brandName);
		}

		return brandId[0].id;
	}

	static async getProductCategoryId(categoryName: string): Promise<number> {
		const category = (await Category.select("id")
			.where("name", categoryName)
			.get()) as any;

		if (category.length != 1)
			throw new RangeError("either no or multiple product categorys found");

		return category[0].id;
	}
}

Relationships.belongsTo(Product, Vendor);
Relationships.belongsTo(Product, Brand);
Relationships.belongsTo(Product, Category);

export class Config extends Model {
	static table = "configs";
	static timestamps = true;

	static fields = {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		search_term: DataTypes.TEXT,
		search_frequency: DataTypes.TIME,
		selected_vendors: DataTypes.TEXT,
	};

	static productCategory() {
		return this.hasOne(Category);
	}
}

Relationships.belongsTo(Config, Category);
