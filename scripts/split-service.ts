#!/usr/bin/env tsx
// Automated service file splitter for files with section-delimited structure
import * as fs from "fs";
import * as path from "path";

const SECTION_REGEX = /^\/\/ ={3,}$/;
const SECTION_TITLE_REGEX = /^\/\/ ([A-Z][\w\s/]+)$/;
const MAX_LINES = 300;

interface Section {
  title: string;
  lines: string[];
  startLine: number;
}

function parseServiceFile(filePath: string): { imports: string[]; sections: Section[] } {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const imports: string[] = [];
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let inHeader = false;
  let headerTitle = "";
  let importsDone = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (SECTION_REGEX.test(line.trim())) {
      inHeader = !inHeader;
      if (!inHeader && headerTitle) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = { title: headerTitle, lines: [], startLine: i + 1 };
        headerTitle = "";
      }
      continue;
    }

    if (inHeader) {
      const match = line.trim().match(SECTION_TITLE_REGEX);
      if (match) {
        headerTitle = match[1].trim();
      }
      continue;
    }

    if (!currentSection) {
      if (line.trim().startsWith("import ") || line.trim().startsWith("} from ") || 
          line.trim().startsWith("  ") && !importsDone || line.trim() === "" && !importsDone) {
        imports.push(line);
        if (line.includes(" from ")) importsDone = false;
      } else if (line.trim() !== "" && !line.trim().startsWith("//")) {
        importsDone = true;
        if (!currentSection) {
          currentSection = { title: "Main", lines: [line], startLine: i };
        }
      } else {
        imports.push(line);
      }
    } else {
      currentSection.lines.push(line);
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return { imports, sections };
}

function groupSections(sections: Section[]): { name: string; sections: Section[] }[] {
  if (sections.length <= 2) {
    return sections.map((s) => ({ name: slugify(s.title), sections: [s] }));
  }

  // Try to keep each group under MAX_LINES
  const groups: { name: string; sections: Section[] }[] = [];
  let current: Section[] = [];
  let currentLines = 0;

  for (const section of sections) {
    const sectionLines = section.lines.length;
    if (currentLines + sectionLines > MAX_LINES && current.length > 0) {
      groups.push({ name: slugify(current[0].title), sections: [...current] });
      current = [section];
      currentLines = sectionLines;
    } else {
      current.push(section);
      currentLines += sectionLines;
    }
  }

  if (current.length > 0) {
    groups.push({ name: slugify(current[0].title), sections: current });
  }

  return groups;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractUsedImports(code: string, allImports: string[]): string[] {
  const used: string[] = [];
  let i = 0;
  while (i < allImports.length) {
    let importBlock = allImports[i];
    // Collect multi-line imports
    while (i < allImports.length - 1 && !importBlock.includes(" from ") && !importBlock.trim().startsWith("//")) {
      i++;
      importBlock += "\n" + allImports[i];
    }
    
    if (importBlock.trim() === "" || importBlock.trim().startsWith("//")) {
      i++;
      continue;
    }

    // Extract imported identifiers
    const identMatch = importBlock.match(/import\s+(?:type\s+)?{([^}]+)}/);
    if (identMatch) {
      const idents = identMatch[1].split(",").map((s) => s.trim().split(/\s+as\s+/).pop()!.trim()).filter(Boolean);
      const anyUsed = idents.some((id) => {
        const regex = new RegExp(`\\b${id}\\b`);
        return regex.test(code);
      });
      if (anyUsed) {
        used.push(importBlock);
      }
    } else {
      // Default or namespace import
      used.push(importBlock);
    }
    i++;
  }
  return used;
}

function getExportedNames(code: string): string[] {
  const names: string[] = [];
  const exportRegex = /export\s+(?:async\s+)?(?:function|const|type|interface|class|enum)\s+(\w+)/g;
  let match;
  while ((match = exportRegex.exec(code)) !== null) {
    names.push(match[1]);
  }
  return names;
}

function splitService(filePath: string, targetApps: string[]) {
  const { imports, sections } = parseServiceFile(filePath);
  
  if (sections.length === 0) {
    console.log(`  No sections found in ${filePath}, skipping`);
    return;
  }

  const groups = groupSections(sections);
  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, ".ts");
  const folderPath = path.join(dir, baseName.replace("-service", ""));

  // Create folder
  fs.mkdirSync(folderPath, { recursive: true });

  const allExports: { name: string; file: string }[] = [];

  for (const group of groups) {
    const code = group.sections.map((s) => s.lines.join("\n")).join("\n\n");
    const usedImports = extractUsedImports(code, imports);
    const fileContent = [...usedImports, "", code].join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
    
    const fileName = `${group.name}.ts`;
    fs.writeFileSync(path.join(folderPath, fileName), fileContent);
    
    const exported = getExportedNames(code);
    for (const exp of exported) {
      allExports.push({ name: exp, file: `./${group.name}` });
    }
    
    console.log(`  Created ${baseName.replace("-service", "")}/${fileName} (${fileContent.split("\n").length} lines, exports: ${exported.join(", ")})`);
  }

  // Create index.ts
  const indexLines: string[] = [];
  const byFile = new Map<string, string[]>();
  for (const exp of allExports) {
    if (!byFile.has(exp.file)) byFile.set(exp.file, []);
    byFile.get(exp.file)!.push(exp.name);
  }
  for (const [file, names] of byFile) {
    indexLines.push(`export { ${names.join(", ")} } from "${file}";`);
  }
  fs.writeFileSync(path.join(folderPath, "index.ts"), indexLines.join("\n") + "\n");
  console.log(`  Created ${baseName.replace("-service", "")}/index.ts`);

  // Create thin wrapper
  const wrapperFolder = `./${baseName.replace("-service", "")}/index`;
  const wrapperExports = allExports.map((e) => e.name);
  const wrapperContent = `// Thin re-export wrapper — preserves the original public API\nexport {\n  ${wrapperExports.join(",\n  ")},\n} from "${wrapperFolder}";\n`;
  fs.writeFileSync(filePath, wrapperContent);
  console.log(`  Replaced ${baseName}.ts with thin wrapper (${wrapperContent.split("\n").length} lines)`);

  // Copy to target apps
  const appDir = filePath.match(/apps\/(\w+)\//)?.[1];
  if (appDir) {
    for (const targetApp of targetApps) {
      if (targetApp === appDir) continue;
      const targetDir = filePath.replace(`apps/${appDir}/`, `apps/${targetApp}/`);
      const targetFolder = targetDir.replace(`${baseName}.ts`, baseName.replace("-service", ""));
      
      if (fs.existsSync(path.dirname(targetDir))) {
        // Copy folder
        fs.cpSync(folderPath, targetFolder, { recursive: true });
        // Copy wrapper
        fs.writeFileSync(targetDir, wrapperContent);
        console.log(`  Copied to apps/${targetApp}/`);
      }
    }
  }
}

// Main
const services = [
  { file: "apps/dashboard/src/lib/services/multi-salon-service.ts", targets: ["admin"] },
  { file: "apps/dashboard/src/lib/services/push-notification-service.ts", targets: ["admin"] },
  { file: "apps/dashboard/src/lib/services/template-service.ts", targets: ["admin"] },
  { file: "apps/dashboard/src/lib/services/unified-notification-service.ts", targets: ["admin"] },
  { file: "apps/dashboard/src/lib/services/employee-performance-service.ts", targets: ["admin"] },
  { file: "apps/dashboard/src/lib/services/forecasting-service.ts", targets: ["admin"] },
  { file: "apps/dashboard/src/lib/services/import-service.ts", targets: [] },
  { file: "apps/dashboard/src/lib/services/clv-service.ts", targets: ["admin"] },
  { file: "apps/dashboard/src/lib/services/audit-trail-service.ts", targets: ["admin", "public"] },
  { file: "apps/dashboard/src/lib/services/performance-service.ts", targets: ["admin"] },
  { file: "apps/dashboard/src/lib/services/customer-history-service.ts", targets: ["admin"] },
  { file: "apps/dashboard/src/lib/services/export-service.ts", targets: ["admin"] },
  { file: "apps/dashboard/src/lib/services/in-app-notification-service.ts", targets: ["admin"] },
  { file: "apps/dashboard/src/lib/services/auth-service.ts", targets: ["admin", "public"] },
];

const root = process.cwd();
for (const svc of services) {
  const fullPath = path.join(root, svc.file);
  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP: ${svc.file} not found`);
    continue;
  }
  const lineCount = fs.readFileSync(fullPath, "utf-8").split("\n").length;
  if (lineCount <= MAX_LINES) {
    console.log(`SKIP: ${svc.file} (${lineCount} lines, already under ${MAX_LINES})`);
    continue;
  }
  console.log(`\nSplitting: ${svc.file} (${lineCount} lines)`);
  try {
    splitService(fullPath, svc.targets);
  } catch (err) {
    console.error(`  ERROR: ${err}`);
  }
}

console.log("\nDone!");
