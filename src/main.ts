import { createPinia } from "pinia";
import uViewPro from "uview-pro";
import { createSSRApp } from "vue";
import App from "./App.vue";

export function createApp() {
	const app = createSSRApp(App);
	const pinia = createPinia();

	app.use(pinia);
	app.use(uViewPro);

	return {
		app,
		pinia, // uni-app 要求返回 pinia 实例
	};
}
