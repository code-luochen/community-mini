import uViewPro from "uview-pro";
import { createSSRApp } from "vue";
import App from "./App.vue";
export function createApp() {
	const app = createSSRApp(App);
	app.use(uViewPro);
	return {
		app,
	};
}
