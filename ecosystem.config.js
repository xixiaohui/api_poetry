module.exports = {
  apps: [
    {
      name: "poetry-gateway",
      script: "node_modules/.bin/next",
      args: "start -p 8080",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
