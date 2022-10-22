import { default as assert } from "assert";
import { default as baretest } from "baretest";
import { config } from "dotenv";
import { ServiceContext } from "../../src/services/ServiceContext";

const test = baretest("MyApp");

config({ path: ".env.test" });

const context = ServiceContext.loadFromEnvVars();

export { assert, context, test };
