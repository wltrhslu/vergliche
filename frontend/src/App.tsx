import { FC, useEffect, useState } from "react";
import logo from "./logo.svg";
import ConfigComponent from "./components/Config";
import "./App.css";
import { IVendor, IVendorList } from "./interfaces/config";

const App: FC = () => {
	const [vendors, setVendors] = useState({
		length: 0,
		data: new Array<IVendor>(),
	});

	useEffect(() => {
		const getData = async () => {
			const data = (await (
				await fetch("http://localhost:8080/vendor")
			).json()) as IVendorList;

			setVendors({
				length: data.length,
				data: data.data,
			});
		};

		getData();
	}, []);

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<p>
					Edit <code>src/App.tsx</code> and save to reload.
				</p>
				<a
					className="App-link"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn React
				</a>
			</header>
			<ConfigComponent data={vendors.data} length={vendors.length} />
		</div>
	);
};

export default App;
