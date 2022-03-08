export interface IConfig {
	id: number;
	search_term?: string;
	search_frequency?: `${number}:${number}`;
	selected_vendors: number[];
	category_id?: number;
}

export interface IVendor {
	id: number;
	vendor_name: string;
	url: string;
}

export interface ICategory {
	id: number;
	category_name: string;
}

export interface IProduct {
	availability: string;
	brandName: string;
	created_at: string | Date;
	id: number;
	manufacturerNumber: string;
	price: string;
	productId: number;
	productName: string;
	productUrl: string;
	rating: string | null;
	updatedAt: string;
	vendorName: string;
}
