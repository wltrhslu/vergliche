import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { FC } from "react";
import { VendorContext } from "../App";
import { CategoryContext } from "../App";
import { ICategory, IConfig } from "../interfaces/config";
import { serverUrl } from "../helpers/serverUrl";

const ConfigForm: FC<{ initialConfig: IConfig | null; onSubmit: Function; visible: boolean }> = (props) => {
	const vendors = useContext(VendorContext);
	const categories = useContext(CategoryContext);
	const [config, setConfig] = useState(props.initialConfig ? Object.assign(props.initialConfig) : ({} as IConfig));

	const handleCheckbox = (vendorId: number) => {
		const newSelectedVendors = config.selected_vendors ? [config.selected_vendors] : [];
		if (newSelectedVendors.includes(vendorId)) newSelectedVendors.splice(newSelectedVendors.indexOf(vendorId), 1);
		else newSelectedVendors.push(vendorId);

		handleChange("selected_vendors", newSelectedVendors);
	};

	const handleChange = (key: string, value: string | number[] | number) => {
		setConfig((previousConfig: IConfig) => ({
			...previousConfig,
			[key]: value,
		}));
	};

	const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		props.onSubmit(config);
	};

	return (
		<form className={props.visible ? "form form-config" : "form form-config hidden"} onSubmit={(event) => onFormSubmit(event)}>
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
					value={categories.find((category) => category.id === config.category_id)?.id}
				>
					{config.id ? null : <option id="null">Select Category</option>}
					{categories.map((category) => (
						<option key={category.id} id={category.id.toString()} value={category.id}>
							{category.category_name}
						</option>
					))}
				</select>
			</fieldset>
			<div className="checkbox-vendor">
				{vendors.map((vendor) => (
					<fieldset key={vendor.id}>
						<label htmlFor={vendor.id + ""}>{vendor.vendor_name}</label>
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

			<input type="submit" className="button button-submit" value={config.id ? "Save" : "Create"}></input>
		</form>
	);
};

export default ConfigForm;
