import { config } from "dotenv";

import { ServiceContext } from "./1-services/ServiceContext";

config();

export const context = ServiceContext.loadFromEnvVars();
