import React, { useState } from "react";
import { FC, FunctionComponent, useEffect } from "react";
import { suspend } from "suspend-react";
import { IConfig } from "../interfaces/config";
import ConfigForm from "./ConfigForm";

const serverUrl = "http://localhost:8080";

const ConfigContainer: FC = () => {
	const [configs, setConfigs] = useState(new Array<{ id: number }>());

	const addConfig = async (config: IConfig) => {
		debugger;

		// const jsonObject = {
		// 	searchTerm: config.searchTerm,
		// 	searchFrequency: config.searchFrequency,
		// 	selectedVendors: config.selectedVendors,
		// 	categoryId: config.categoryId,
		// };

		// const response = await (
		// 	await fetch(`${serverUrl}/config`, {
		// 		method: "POST",
		// 		headers: {
		// 			"Content-Type": "application/json",
		// 		},
		// 		body: JSON.stringify(jsonObject),
		// 	})
		// ).json();

		// console.log(response);
	};

	useEffect(() => {
		const getConfigs = async () => {
			setConfigs(
				(await (await fetch(`${serverUrl}/config`)).json()) as [{ id: number }]
			);
		};

		getConfigs();
	}, []);

	const onSubmit = async (config: IConfig) => {
		let data: [{ id: number }];

		if (config.id) {
			data = (await (
				await fetch(`${serverUrl}/config`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(config),
				})
			).json()) as [{ id: number }];
		} else {
			data = (await (
				await fetch(`${serverUrl}/config`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(config),
				})
			).json()) as [{ id: number }];
		}

		setConfigs(data);
	};

	return (
		<div>
			{configs.map((config) => {
				return (
					<ConfigForm
						key={config.id}
						configId={config.id}
						onSubmit={onSubmit}
					></ConfigForm>
				);
			})}

			<ConfigForm configId={null} onSubmit={onSubmit}></ConfigForm>
		</div>
	);
};

export default ConfigContainer;
