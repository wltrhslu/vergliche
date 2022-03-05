import { useEffect, useState, FC } from "react";
import { IConfig, IProduct } from "../interfaces/config";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { serverUrl } from "../helpers/serverUrl";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CheapestProductChart: FC<{ configId: number }> = (props) => {
	const [config, setConfig] = useState({} as IConfig);
	const [chartData, setchartData] = useState(
		{} as {
			datasets: [{ data: IProduct[] }];
		}
	);

	const options: any = {
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				callbacks: {
					title: (context: any) => context[0].dataset.data[context[0].dataIndex].productName,
					afterTitle: (context: any) => context[0].dataset.data[context[0].dataIndex].brandName,
					label: (context: any) => context.dataset.data[context.dataIndex].brandName,
				},
			},
		},
		parsing: {
			xAxisKey: "created_at",
			yAxisKey: "price",
		},
		responsive: true,
	};

	useEffect(() => {
		const getData = async () => {
			setConfig((await (await fetch(`${serverUrl}/config/${props.configId}`)).json()) as IConfig);
			const cheapestProducts = (await (
				await fetch(`${serverUrl}/cheapest-products/${props.configId}`)
			).json()) as IProduct[];

			const data = cheapestProducts.map((product) => {
				return {
					...product,
					created_at: new Date(product.created_at).toLocaleString(),
				};
			});

			setchartData({ datasets: [{ data }] });
		};

		const sse = new EventSource(`${serverUrl}/sse/${props.configId}`, { withCredentials: true });

		sse.onmessage = (e) => getData();
		sse.onerror = () => {
			sse.close();
		};

		getData();
	}, []);

	if (chartData?.datasets?.length)
		return <Line datasetIdKey={props.configId.toString()} data={chartData} options={options}></Line>;
	return <span></span>;
};

export default CheapestProductChart;
