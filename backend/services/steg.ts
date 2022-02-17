import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-native.ts";

export class StegElectronics {
	async fetchFromSteg() {
		const html = new DOMParser().parseFromString(
			await (
				await fetch(
					"https://www.steg-electronics.ch/de/search?suche=3080&categoryId=11885"
				)
			).text(),
			"text/html"
		);

		console.log(html);
	}
}
