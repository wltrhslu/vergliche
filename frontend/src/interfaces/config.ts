export interface IConfig {
	id?: number;
	search_term?: string;
	search_frequency?: `${number}:${number}`;
	selected_vendors: number[];
	category_id?: number;
}

// export interface IConfigList {
// 	length: number;
// 	data: number[];
// }

export interface IVendor {
	id: number;
	name: string;
	url: string;
}

export interface ICategory {
	id: number;
	name: string;
}
