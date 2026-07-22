/** @type {import('next').NextConfig} */
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath =
  process.env.GITHUB_ACTIONS === "true" && repositoryName
    ? `/${repositoryName}`
    : "";

const nextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
