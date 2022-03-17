import { createContext, FC, useState } from "react";
import "./App.css";
import { ICategory, IVendor } from "./interfaces/config";
import AppSettingsButton from "./components/AppSettingsButton";
import { suspend } from "suspend-react";
import ConfigContainer from "./components/ConfigContainer";
import AppSettings from "./components/AppSettings";
import { serverUrl } from "./helpers/serverUrl";

export const VendorContext = createContext(new Array<IVendor>());
export const CategoryContext = createContext(new Array<ICategory>());

const App: FC = () => {
	const vendors = suspend(async () => {
		const data = await (await fetch(`${serverUrl}/vendor`)).json();
		return data.data;
	}, []) as Array<IVendor>;

	const categories = suspend(async () => {
		const data = await (await fetch(`${serverUrl}/category`)).json();
		return data.data;
	}, []) as Array<ICategory>;

	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<div className="App">
			<VendorContext.Provider value={vendors}>
				<CategoryContext.Provider value={categories}>
					<div className="app-header">
						<span>vergliche</span>
						<button className="button button-refresh"></button>
						<AppSettingsButton onClick={setIsModalOpen} />
					</div>
					<ConfigContainer></ConfigContainer>
					<AppSettings state={isModalOpen} setState={setIsModalOpen}></AppSettings>
				</CategoryContext.Provider>
			</VendorContext.Provider>
		</div>
	);
};

export default App;
