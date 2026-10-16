import fs from "fs";
import path from "path";
import { RunnerConfig } from "../config";

export class SkillTools {
  private config: RunnerConfig;

  constructor(config: RunnerConfig) {
    this.config = config;
  }

  async listSkills(): Promise<{
    content: Array<{ type: string; text: string }>;
    isError: boolean;
  }> {
    const skillsDir = path.join(path.dirname(__filename), "..", "..", "skills");

    try {
      if (!fs.existsSync(skillsDir)) {
        return { content: [{ type: "text", text: "No skills installed" }], isError: false };
      }

      const files = fs.readdirSync(skillsDir).filter((f) => f.endsWith(".md"));
      const skills = files.map((f) => f.replace(".md", ""));

      return {
        content: [{ type: "text", text: skills.join("\n") || "No skills installed" }],
        isError: false,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }

  async getSkill(args: Record<string, unknown>): Promise<{
    content: Array<{ type: string; text: string }>;
    isError: boolean;
  }> {
    const skillName = args.name as string;
    if (!skillName) {
      return { content: [{ type: "text", text: "Error: name is required" }], isError: true };
    }

    const skillsDir = path.join(path.dirname(__filename), "..", "..", "skills");
    const skillFile = path.join(skillsDir, `${skillName}.md`);

    try {
      if (!fs.existsSync(skillFile)) {
        return {
          content: [{ type: "text", text: `Skill not found: ${skillName}` }],
          isError: true,
        };
      }

      const content = fs.readFileSync(skillFile, "utf-8");
      return { content: [{ type: "text", text: content }], isError: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }
}
