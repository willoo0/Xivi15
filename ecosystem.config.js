export const apps = [
  {
    name: "xivi",
    script: "bun install && bun run build && bun run start",
    interpreter: "none",
    exec_mode: "fork",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
    },
  },
];