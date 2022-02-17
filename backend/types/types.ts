type Product_Type = {
	name: string;
	price: number;
	availability_type: string;
	url: string;
	vendor_id: number;
	vendor_product_id: string;
	brandName: string;
	productType: string;
	rating?: number;
};

type Time = `${number}:${number}:${number}`;
