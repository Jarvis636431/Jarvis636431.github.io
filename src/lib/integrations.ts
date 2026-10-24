import { resolveIntegrations } from "../config/integrations.mjs";

export const integrations = resolveIntegrations(import.meta.env);
