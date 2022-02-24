import { createContext, FC, SetStateAction, useState } from "react";
import "./App.css";
import { ICategory, IConfig, IVendor } from "./interfaces/config";
import AppSettingsButton from "./components/AppSettingsButton";
import { suspend } from "suspend-react";
import ConfigContainer from "./components/ConfigContainer";
import AppSettings from "./components/AppSettings";

const serverUrl = "http://localhost:8080";

export const VendorContext = createContext(new Array<IVendor>());

const App: FC = () => {
	const vendors = suspend(async () => {
		const data = await (await fetch(`${serverUrl}/vendor`)).json();
		return data.data;
	}, []) as Array<IVendor>;

	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<div className="App">
			<span>vergliche</span>
			<VendorContext.Provider value={vendors}>
				<AppSettingsButton onClick={setIsModalOpen} />
				<button className="button button-refresh">refresh all</button>
				<ConfigContainer></ConfigContainer>
				<AppSettings
					state={isModalOpen}
					setState={setIsModalOpen}
				></AppSettings>
			</VendorContext.Provider>
		</div>
	);
};

export default App;
