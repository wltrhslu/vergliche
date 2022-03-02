import { useState } from "react";
import { FC, useEffect } from "react";
import { IConfig } from "../interfaces/config";
import Chart from "./Chart";
import ConfigForm from "./ConfigForm";
import { serverUrl } from "../helpers/serverUrl";

const ConfigContainer: FC = () => {
	const [configs, setConfigs] = useState(new Array<{ id: number }>());

	useEffect(() => {
		const getConfigs = async () => {
			setConfigs((await (await fetch(`${serverUrl}/config`)).json()) as [{ id: number }]);
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
					<section>
						<Chart key={config.id} configId={config.id}></Chart>
						<ConfigForm key={config.id} configId={config.id} onSubmit={onSubmit}></ConfigForm>
					</section>
				);
			})}

			<ConfigForm configId={null} onSubmit={onSubmit}></ConfigForm>
		</div>
	);
};

export default ConfigContainer;
