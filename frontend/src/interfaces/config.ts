export interface IConfig {
	id: number;
	search_term: string;
	search_frequency: `${number}:${number}:${number}`;
	selected_vendors: string;
	category_id: number;
}

export interface IConfigList {
	[key: number]: IConfig;
}

export interface IVendor {
	id: number;
	name: string;
	url: string;
	created_at: string;
	updated_at: string;
}

export interface IVendorList {
	length: number;
	data: Array<IVendor>;
}
