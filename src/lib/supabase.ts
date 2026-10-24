import { createClient } from "@supabase/supabase-js";
import { integrations } from "@lib/integrations";

const { configured, url, anonymousKey } = integrations.viewCounter;

export const supabase = configured ? createClient(url, anonymousKey) : null;
