import { useState } from "react";
import { FC, useEffect } from "react";
import { IConfig } from "../interfaces/config";
import CheapestProductChart from "./CheapestProductChart";
import ConfigForm from "./ConfigForm";
import { serverUrl } from "../helpers/serverUrl";

const ConfigContainer: FC = () => {
	const [configs, setConfigs] = useState(new Array<IConfig>());
	const [formVisible, setFormVisible] = useState(new Array<{ id: number; visible: boolean }>());

	useEffect(() => {
		const getConfigs = async () => {
			const data = (await (await fetch(`${serverUrl}/config`)).json()) as IConfig[];
			setConfigs(data);

			const initialFormState = data.map((config) => ({ id: config.id, visible: false }));
			setFormVisible(initialFormState);
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

	const updateVisibility = (id: number) => {
		const index = formVisible.findIndex((x) => x.id === id);
		setFormVisible([
			...formVisible.slice(0, index),
			Object.assign({}, formVisible[index], { visible: !formVisible[index].visible }),
			...formVisible.slice(index + 1),
		]);
	};

	return (
		<div className="app-body">
			{configs.map((config, index) => {
				return (
					<section key={config.id} className="card">
						<div className="card-header">
							<h2>{config.search_term}</h2>
							<button className="button button-refresh-black"></button>
							<button className="button button-settings-black" onClick={() => updateVisibility(config.id)}></button>
						</div>
						<div className="card-body">
							<CheapestProductChart configId={config.id}></CheapestProductChart>
							<div className="tooltip"></div>
							<ConfigForm initialConfig={config} onSubmit={onSubmit} visible={formVisible[index].visible}></ConfigForm>
						</div>
					</section>
				);
			})}

			{/* <ConfigForm initialConfig={null} onSubmit={onSubmit}></ConfigForm> */}
		</div>
	);
};

export default ConfigContainer;
