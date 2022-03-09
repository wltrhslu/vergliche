import { Model, DataTypes, Relationships } from "https://deno.land/x/denodb@v1.0.40/mod.ts";

export class Vendor extends Model {
	static table = "vendors";
	static timestamps = true;

	static fields = {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		vendor_name: DataTypes.STRING,
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
				vendor_name: "Digitec",
			},
			{
				vendor_name: "Steg",
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
		brand_name: DataTypes.STRING,
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
		category_name: DataTypes.STRING,
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
				category_name: "Graphics Card",
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

	static products() {
		return this.hasMany(Product);
	}

	static cheapestProducts() {
		return this.hasMany(CheapestProduct);
	}
}

Relationships.belongsTo(Config, Category);

export class Product extends Model {
	static table = "products";
	static timestamps = true;

	static fields = {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		product_name: DataTypes.TEXT,
		price: {
			type: DataTypes.DECIMAL,
			allowNull: true,
		},
		availability: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		product_url: DataTypes.TEXT,
		manufacturer_number: {
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

	static config() {
		return this.hasOne(Config);
	}

	static cheapestProducts() {
		return this.hasMany(CheapestProduct);
	}
}

Relationships.belongsTo(Product, Vendor);
Relationships.belongsTo(Product, Brand);
Relationships.belongsTo(Product, Category);
Relationships.belongsTo(Product, Config);

export class CheapestProduct extends Model {
	static table = "cheapest_products";

	static fields = {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		current_price: DataTypes.DECIMAL,
		created_at: DataTypes.DATETIME,
	};

	static config() {
		return this.hasOne(Config);
	}

	static product() {
		return this.hasOne(Product);
	}
}

Relationships.belongsTo(CheapestProduct, Config);
Relationships.belongsTo(CheapestProduct, Product);
