import { IProduct } from "../interfaces/config";

export const externalTooltipHandler = (context: {
	chart: any;
	tooltip: { caretX: number; caretY: number; dataPoints: { raw: IProduct }[]; opacity: number; options: any };
}) => {
	// Tooltip Element
	const { chart, tooltip } = context;
	const tooltipElement = chart.canvas.parentNode.querySelector(".tooltip") as HTMLElement;

	// Hide if no tooltip
	if (tooltip.opacity === 0) {
		tooltipElement.style.opacity = "0";
		return;
	}

	let template = "";

	if (tooltip.dataPoints?.[0]?.raw) {
		template = getTemplate(tooltip.dataPoints?.[0]?.raw);
	}

	tooltipElement.innerHTML = template;

	const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

	tooltipElement.style.left = positionX + tooltip.caretX + "px";
	tooltipElement.style.top = positionY + tooltip.caretY + 10 + "px";
	tooltipElement.style.opacity = "1";

	tooltipElement.addEventListener("mouseover", () => {
		tooltipElement.style.opacity = "1";
	});

	tooltipElement.addEventListener("mouseout", () => {
		tooltipElement.style.opacity = "0";
	});
};

const getTemplate = (product: IProduct) => `
	<h3>${product.productName}</h3>
	<div class="table">
		<label>Brand:</label><span>${product.brandName}</span>
		<label>Vendor:</label><span>${product.vendorName}</span>
		<label>Url:</label><a target="_blank" href="${product.productUrl}">${product.productUrl}</a>
		<label>Current Price:</label><span>${product.current_price}</span>
		<label>Recorded At:</label><span>${product.created_at}</span>
	</div>
`;
