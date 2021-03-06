import { FC, useState } from "react";
const AppSettingsButton: FC<{ onClick: Function }> = ({ onClick }) => {
	const onClickHandler = () => {
		onClick(true);
	};

	return <button className="button button-settings" onClick={onClickHandler}></button>;
};

export default AppSettingsButton;
