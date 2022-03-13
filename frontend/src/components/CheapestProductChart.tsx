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
	TimeScale,
} from "chart.js";
import Zoom from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import { serverUrl } from "../helpers/serverUrl";
import { externalTooltipHandler } from "../helpers/customTooltip";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Zoom);

const CheapestProductChart: FC<{ configId: number }> = (props) => {
	const [chartData, setchartData] = useState(
		{} as {
			datasets: [{ data: IProduct[] }];
		}
	);

	const scales = {
		x: {
			position: "bottom",
			type: "time",
			ticks: {
				autoSkip: true,
				autoSkipPadding: 50,
				maxRotation: 0,
			},
			time: {
				displayFormats: {
					hour: "HH:mm",
					minute: "HH:mm",
					second: "HH:mm:ss",
				},
			},
		},
	};

	const options: any = {
		scales: scales,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				enabled: false,
				position: "nearest",
				external: externalTooltipHandler,
			},
			zoom: {
				pan: {
					enabled: true,
					mode: "x",
				},
				zoom: {
					wheel: {
						enabled: true,
					},
					mode: "x",
				},
			},
		},
		parsing: {
			xAxisKey: "created_at",
			yAxisKey: "current_price",
		},
		responsive: true,
	};

	useEffect(() => {
		const getData = async () => {
			const cheapestProducts = (await (
				await fetch(`${serverUrl}/cheapest-products/${props.configId}`)
			).json()) as IProduct[];

			const data = cheapestProducts.map((product) => {
				return {
					...product,
					created_at: new Date(product.created_at),
				};
			});

			setchartData({ datasets: [{ data }] });
		};

		const sse = new EventSource(`${serverUrl}/sse/${props.configId}`, { withCredentials: true });

		sse.onmessage = (event: MessageEvent) => {
			setchartData((previousData) => {
				debugger;
				const product = JSON.parse(event.data) as IProduct;
				product.created_at = new Date(product.created_at);

				const data = previousData.datasets[0].data;
				data.push(product);
				return {
					datasets: [{ data }],
				};
			});
		};

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
