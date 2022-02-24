import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
ReactDOM.createRoot(rootElement).render(
	<Suspense fallback={<span className="icon icon-loading"></span>}>
		<App />
	</Suspense>
);
