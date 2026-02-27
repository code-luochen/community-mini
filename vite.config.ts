import { resolve } from "node:path";
import uni from "@dcloudio/vite-plugin-uni";
import Components from "@uni-helper/vite-plugin-uni-components";
import { uViewProResolver } from "@uni-helper/vite-plugin-uni-components/resolvers";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		Components({
			resolvers: [uViewProResolver()],
		}),
		uni(),
	],
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},
});
