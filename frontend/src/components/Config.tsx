import { FC, FunctionComponent, useEffect } from "react";
import { IVendorList } from "../interfaces/config";

const ConfigComponent: FC<IVendorList> = (props) => {
	return (
		<form className="form form-config">
			<fieldset>
				<label htmlFor="search-term">Searchterm</label>
				<input
					type="text"
					name="search-term"
					id="search-term"
					placeholder="3070Ti"
				/>
			</fieldset>
			<fieldset>
				<label htmlFor="search-frequency">Search frequency</label>
				<input
					type="text"
					name="search-frequency"
					id="search-frequency"
					placeholder="01:00:00"
				/>
			</fieldset>
			<div className="checkbox-vendor">
				{props.data.map((vendor) => (
					<fieldset>
						<label htmlFor={vendor.name}>{vendor.name}</label>
						<input type="checkbox" id={vendor.name} name={vendor.name}></input>
					</fieldset>
				))}
			</div>

			<input
				type="submit"
				className="button button-submit"
				value="Save"
			></input>
		</form>
	);
};

export default ConfigComponent;
