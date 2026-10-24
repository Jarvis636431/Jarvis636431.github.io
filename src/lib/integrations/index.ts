import { resolveIntegrations } from "./resolve.mjs";

export const integrations = resolveIntegrations(import.meta.env);
