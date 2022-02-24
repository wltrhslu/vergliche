interface IConfig {
	search_term: string;
	search_frequency: `${number}:${number}`;
	selected_vendors: number[];
	categoryId: number;
}

interface IVendor {
	id: number;
	name: string;
	url: string;
}

interface IVendorCategory {
	id: number;
	vendorId: number;
	categoryId: number;
	vendorCategoryIdentifier: number;
}

interface IProduct {
	name: string;
	price: number;
	availability: string | null;
	url: string;
	manufacturer_number: string | null;
	rating: number | null;
	vendor_id: number;
	brand_id: number;
	categoryId: number;
	config_id: number;
}
