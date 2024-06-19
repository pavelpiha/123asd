import fs from "fs";
import path from "path";

function addJsExtension(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      addJsExtension(filePath);
    } else if (file.endsWith(".js")) {
      let content = fs.readFileSync(filePath, "utf8");
      // Adjusted regex to match only relative paths starting with ./
      content = content.replace(/from\s+['"](\.\/[^'"]+)['"]/g, (match, p1) => {
        if (!p1.endsWith(".js")) {
          return match.replace(p1, `${p1}.js`);
        }
        return match;
      });
      fs.writeFileSync(filePath, content, "utf8");
    }
  });
}

// Replace './dist' with your actual output directory
addJsExtension("./dist");
