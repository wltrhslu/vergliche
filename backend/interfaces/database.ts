interface IConfig {
	id: number;
	search_term: string;
	search_frequency: `${number}:${number}`;
	selected_vendors: number[];
	categoryId: number;
}

interface IVendor {
	id: number;
	vendor_name: string;
	vendor_url: string;
}

interface IVendorCategory {
	id: number;
	vendorId: number;
	categoryId: number;
	vendorCategoryIdentifier: number;
}

interface IProduct {
	product_name: string;
	price: number | null;
	availability: string | null;
	product_url: string;
	manufacturer_number: string | null;
	rating: number | null;
	ignore_cheapest: number;
	vendor_id: number;
	brand_id: number;
	categoryId: number;
	config_id: number;
}
