import path from "path";
import { createDefineMock } from "vite-plugin-mock-dev-server";

export const defineMock = createDefineMock((mock) => {
  // 拼接url，直接使用BASE_API，不附加/api/v1/
  mock.url = path.join(import.meta.env.VITE_APP_BASE_API, mock.url);
});
