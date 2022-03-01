export interface IConfig {
	id?: number;
	search_term?: string;
	search_frequency?: `${number}:${number}`;
	selected_vendors: number[];
	category_id?: number;
}

export interface IVendor {
	id: number;
	name: string;
	url: string;
}

export interface ICategory {
	id: number;
	name: string;
}

export interface IProduct {
	name: string;
	price: number;
	availability: string | null;
	url: string;
	manufacturer_number: string | null;
	rating: number | null;
	vendor: string;
	brand: string;
}
