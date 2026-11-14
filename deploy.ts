import {
  before,
  cd,
  defineConfig,
  local,
  run,
  set,
  task,
} from "@catapultjs/deploy";
import "@catapultjs/deploy/recipes/adonisjs";
import "@catapultjs/deploy/recipes/pm2";
import "@catapultjs/deploy/recipes/rsync";

set("rsync_source_path", "./apps/web/build");
// The production .env lives on the server (shared/.env); a release only links it.
set("rsync_excludes", [".env"]);
set("shared_dirs", ["storage", "logs", "tmp"]);
set("adonisjs_path", "");

task("deploy:build", async () => {
  await local("cp ecosystem.config.cjs apps/web/build/ecosystem.config.cjs");
  await local("cp compose.prod.yaml apps/web/build/compose.prod.yaml");
});
before("deploy:update_code", "deploy:build");

task("deploy:install", () => {
  cd("{{release_path}}");
  // Vite already bundled @workspace/ui into the build, and `workspace:*` does
  // not resolve outside the monorepo, so the artifact drops it before installing.
  run(
    `node -e "const fs=require('fs'),p=JSON.parse(fs.readFileSync('package.json'));delete p.dependencies['@workspace/ui'];fs.writeFileSync('package.json',JSON.stringify(p,null,2))"`,
  );
  // The build has no lockfile of its own, so the install cannot be frozen.
  run("pnpm install --prod --no-frozen-lockfile");
});

export default defineConfig({
  keepReleases: 3,

  hosts: [
    {
      name: "production",
      ssh: process.env.DEPLOY_SSH ?? "deploy@example.com",
      deployPath: process.env.DEPLOY_PATH ?? "/home/deploy/app",
      healthcheck: {
        url: "http://localhost:3333/health/live",
        retries: 10,
        delayMs: 3000,
      },
    },
  ],
});
