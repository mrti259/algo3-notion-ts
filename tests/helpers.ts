import assert from "assert";
import baretest from "baretest";

const tests: Array<ReturnType<typeof baretest>> = [];

function createTests(name: string) {
  const test = baretest(name);
  tests.push(test);
  return [test, test.skip] as const;
}

async function runTests() {
  for (const test of tests) {
    await test.run();
  }
}

export { assert, createTests, runTests };
