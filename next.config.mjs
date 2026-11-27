import fs from "node:fs";
import path from "node:path";

const prismaOutputDir = path.join(process.cwd(), "src", "generated", "prisma");

class CopyPrismaEnginesPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap("CopyPrismaEnginesPlugin", () => {
      if (!fs.existsSync(prismaOutputDir)) return;
      const engineFiles = fs
        .readdirSync(prismaOutputDir)
        .filter((f) => f.includes("query_engine") && f.endsWith(".node"));

      const destDirs = [
        compiler.outputPath,
        path.join(compiler.outputPath, "chunks"),
      ];

      for (const destDir of destDirs) {
        fs.mkdirSync(destDir, { recursive: true });
        for (const file of engineFiles) {
          const src = path.join(prismaOutputDir, file);
          const dst = path.join(destDir, file);
          if (!fs.existsSync(dst)) {
            fs.copyFileSync(src, dst);
          }
        }
      }
    });
  }
}

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/**": [
      "./src/generated/prisma/*query_engine*.node",
      "./.next/server/chunks/*query_engine*.node",
    ],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.plugins.push(new CopyPrismaEnginesPlugin());
    }
    return config;
  },
};

export default nextConfig;
