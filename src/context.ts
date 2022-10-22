import { config } from "dotenv";
import { ServiceContext } from "./services/ServiceContext";

config();

export const context = ServiceContext.loadFromEnvVars();
