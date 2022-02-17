interface IConfig extends IterableIterator<string> {
	searchTerm: string;
	searchFrequency: Time;
	selectedVendors: string;
	productCategoryId: number;
}
