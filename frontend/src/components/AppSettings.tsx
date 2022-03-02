import { FC, forwardRef, useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { VendorContext } from "../App";
import { ICategory } from "../interfaces/config";
import { serverUrl } from "../helpers/serverUrl";

Modal.setAppElement("#root");
const customStyles = {
	content: {
		top: "50%",
		left: "50%",
		right: "auto",
		bottom: "auto",
		marginRight: "-50%",
		transform: "translate(-50%, -50%)",
	},
};
// const tableIcons = {
// 	Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
// };

const AppSettingsButton: FC<{ state: boolean; setState: Function }> = ({ state, setState }) => {
	const closeModal = () => setState(false);
	const vendors = useContext(VendorContext);
	const columns = [
		{
			Header: "Name",
			accessor: "name",
		},
		...vendors.map((vendor) => {
			return {
				Header: vendor.vendor_name,
				accessor: vendor.id,
			};
		}),
	];

	const [vendorCategories, setVendorCategories] = useState(new Array<IVendorCategories>());

	useEffect(() => {
		async function getData() {
			const data = await (await fetch(`${serverUrl}/vendor-category`)).json();

			setVendorCategories(data.data);
		}

		getData();
	}, []);

	return (
		<Modal isOpen={state} onRequestClose={closeModal} style={customStyles} contentLabel="Example Modal">
			<h2>Hello</h2>
			<button onClick={closeModal}>close</button>
			<div>I am a modal</div>
		</Modal>
	);
};

export default AppSettingsButton;

interface IVendorCategories {}
