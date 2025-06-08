import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cwd } from "node:process";

async function main() {
  let promises = [];
  for (let i = 1; i < 100; i++) {
    promises.push(
      copyFile(
        resolve(cwd(), "./src/user-repository.spec.ts"),
        resolve(cwd(), `./src/user-repository-${i}.spec.ts`),
      ),
    );
  }
}

main();
