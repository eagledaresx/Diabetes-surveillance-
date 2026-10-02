const fs = require("fs");
const path = require("path");
const { ZipArchive } = require("archiver");

const outputDir = path.resolve(__dirname, "..", "public");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const zipPath = path.join(outputDir, "diabetes-surveillance-android-project.zip");
const output = fs.createWriteStream(zipPath);
const archive = new ZipArchive({ zlib: { level: 9 } });

output.on("close", function () {
  const stats = fs.statSync(zipPath);
  console.log(`[ZIP] Android project archive generated: ${stats.size} bytes at ${zipPath}`);
  
  const distDir = path.resolve(__dirname, "..", "dist");
  if (fs.existsSync(distDir)) {
    fs.copyFileSync(zipPath, path.join(distDir, "diabetes-surveillance-android-project.zip"));
    console.log(`[ZIP] Copied archive to dist folder`);
  }
});

archive.on("error", function (err) {
  console.error("Archive error:", err);
  process.exit(1);
});

archive.pipe(output);

if (fs.existsSync("android")) {
  archive.directory("android/", "android");
}
if (fs.existsSync("capacitor.config.ts")) {
  archive.file("capacitor.config.ts", { name: "capacitor.config.ts" });
}
if (fs.existsSync("README_ANDROID.md")) {
  archive.file("README_ANDROID.md", { name: "README_ANDROID.md" });
}

archive.finalize();
