import { Database, MySQLConnector } from "https://deno.land/x/denodb/mod.ts";
import {
	Vendor,
	Brand,
	Category,
	Vendor_Category,
	Config,
	Product,
} from "../db/Models.ts";
import type { Config_Type } from "../types/databaseTypes.ts";

export class DatabaseService {
	private db: Database;

	constructor(
		private databaseName: string,
		private host: string,
		private username: string,
		private password: string
	) {
		const connector = new MySQLConnector({
			database: this.databaseName,
			host: this.host,
			username: this.username,
			password: this.password,
		});

		this.db = new Database(connector);

		this.db.link([Vendor, Brand, Category, Vendor_Category, Config, Product]);
	}

	async initDatabase() {
		await this.db.sync();
		if (!(await Vendor.count())) {
			await Vendor.addVendors();
		}
		if (!(await Category.count())) {
			await Category.addProductCategory();
		}
	}

	async getVendors() {
		return await Vendor.all();
	}
}
