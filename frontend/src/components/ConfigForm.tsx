import React, { useContext, useEffect, useState } from "react";
import { FC } from "react";
import { VendorContext } from "../App";
import { ICategory, IConfig } from "../interfaces/config";

const serverUrl = "http://localhost:8080";

const ConfigForm: FC<{ configId: number | null; onSubmit: Function }> = (props) => {
	const vendors = useContext(VendorContext);

	const [config, setConfig] = useState({} as IConfig);
	const [categories, setCategories] = useState(new Array<ICategory>());

	useEffect(() => {
		const getConfig = async () => {
			setConfig((await (await fetch(`${serverUrl}/config/${props.configId}`)).json()) as IConfig);
		};

		const getCategories = async () => {
			setCategories((await (await fetch(`${serverUrl}/category`)).json()) as ICategory[]);
		};

		if (props.configId) getConfig();
		getCategories();
	}, []);

	const handleCheckbox = (vendorId: number) => {
		const newSelectedVendors = config.selected_vendors ? [...config.selected_vendors] : [];
		if (newSelectedVendors.includes(vendorId)) newSelectedVendors.splice(newSelectedVendors.indexOf(vendorId), 1);
		else newSelectedVendors.push(vendorId);

		handleChange("selected_vendors", newSelectedVendors);
	};

	const handleChange = (key: string, value: string | number[] | number) => {
		setConfig((previousConfig) => ({
			...previousConfig,
			[key]: value,
		}));
	};

	const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		props.onSubmit(config);
	};

	return (
		<form className="form form-config" onSubmit={(event) => onFormSubmit(event)}>
			<fieldset>
				<label htmlFor="search_term">Searchterm</label>
				<input
					type="text"
					name="search_term"
					id="search_term"
					placeholder="3070Ti"
					value={config.search_term}
					onChange={(event) => {
						handleChange(event.target.name, event.target.value);
					}}
				/>
			</fieldset>
			<fieldset>
				<label htmlFor="search_frequency">Search frequency</label>
				<input
					type="text"
					name="search_frequency"
					id="search_frequency"
					placeholder="hh:mm"
					value={config.search_frequency?.slice(0, 5)}
					onChange={(event) => {
						handleChange(event.target.name, event.target.value);
					}}
				/>
			</fieldset>
			<fieldset>
				<select
					name="category_id"
					onChange={(event) => {
						handleChange(event.currentTarget.name, parseInt(event.currentTarget.value));
					}}
				>
					{config.id ? null : <option id="null">Select Category</option>}
					{categories.map((category) => (
						<option
							key={category.id}
							id={category.id.toString()}
							selected={category.id === config.category_id ? true : false}
							value={category.id}
						>
							{category.name}
						</option>
					))}
				</select>
			</fieldset>
			<div className="checkbox-vendor">
				{vendors.map((vendor) => (
					<fieldset key={vendor.id}>
						<label htmlFor={vendor.id + ""}>{vendor.name}</label>
						<input
							type="checkbox"
							id={vendor.id + ""}
							name={vendor.id + ""}
							checked={config.selected_vendors?.includes(vendor.id)}
							onChange={() => handleCheckbox(vendor.id)}
						></input>
					</fieldset>
				))}
			</div>

			<input type="submit" className="button button-submit" value={props.configId ? "Save" : "Create"}></input>
		</form>
	);
};

export default ConfigForm;
