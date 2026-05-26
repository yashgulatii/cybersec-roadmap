import { onRequestOptions as __api_auth_js_onRequestOptions } from "D:\\Programming\\Roadmap\\functions\\api\\auth.js"
import { onRequestPost as __api_auth_js_onRequestPost } from "D:\\Programming\\Roadmap\\functions\\api\\auth.js"
import { onRequestGet as __api_progress_js_onRequestGet } from "D:\\Programming\\Roadmap\\functions\\api\\progress.js"
import { onRequestOptions as __api_progress_js_onRequestOptions } from "D:\\Programming\\Roadmap\\functions\\api\\progress.js"
import { onRequestPost as __api_progress_js_onRequestPost } from "D:\\Programming\\Roadmap\\functions\\api\\progress.js"

export const routes = [
    {
      routePath: "/api/auth",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_auth_js_onRequestOptions],
    },
  {
      routePath: "/api/auth",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_js_onRequestPost],
    },
  {
      routePath: "/api/progress",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_progress_js_onRequestGet],
    },
  {
      routePath: "/api/progress",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_progress_js_onRequestOptions],
    },
  {
      routePath: "/api/progress",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_progress_js_onRequestPost],
    },
  ]