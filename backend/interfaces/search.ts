export interface ISearchSubService {
	searchProducts: (searchTerm: string, category: string, vendorId: number, categoryId: number, configId: number) => Promise<IProduct[]>;
	getServiceName: () => string;
}
