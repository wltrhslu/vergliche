import { useState } from "react";
import { FC, useEffect } from "react";
import { IConfig } from "../interfaces/config";
import CheapestProductChart from "./CheapestProductChart";
import ConfigForm from "./ConfigForm";
import { serverUrl } from "../helpers/serverUrl";

const ConfigContainer: FC = () => {
	const [configs, setConfigs] = useState(new Array<IConfig>());
	const [settingsVisible, setSettingsVisible] = useState([{}] as [{ id: number; visible: boolean }]);

	useEffect(() => {
		const getConfigs = async () => {
			const data = (await (await fetch(`${serverUrl}/config`)).json()) as IConfig[];
			setConfigs(data);
		};

		getConfigs();
	}, []);

	const onSubmit = async (config: IConfig) => {
		let data: IConfig[];

		if (config.id) {
			data = (await (
				await fetch(`${serverUrl}/config`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(config),
				})
			).json()) as IConfig[];
		} else {
			data = (await (
				await fetch(`${serverUrl}/config`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(config),
				})
			).json()) as IConfig[];
		}

		setConfigs(data);
	};

	return (
		<div>
			{configs.map((config) => {
				return (
					<section className="card">
						<div className="card-header">
							<h1>{config.search_term}</h1>
							<button className="button button-refresh">refresh</button>
							<button className="button button-refresh">settings</button>
						</div>
						<CheapestProductChart key={config.id} configId={config.id}></CheapestProductChart>
						<ConfigForm key={config.id} initialConfig={config} onSubmit={onSubmit}></ConfigForm>
					</section>
				);
			})}

			<ConfigForm initialConfig={null} onSubmit={onSubmit}></ConfigForm>
		</div>
	);
};

export default ConfigContainer;
