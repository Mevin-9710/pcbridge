import { RunnerConfig } from "./config";
import { FileTools } from "./tools/file-tools";
import { TerminalTools } from "./tools/terminal-tools";
import { GitTools } from "./tools/git-tools";
import { SkillTools } from "./tools/skill-tools";
import { SearchTools } from "./tools/search-tools";

export class ToolExecutor {
  private config: RunnerConfig;
  private fileTools: FileTools;
  private terminalTools: TerminalTools;
  private gitTools: GitTools;
  private skillTools: SkillTools;
  private searchTools: SearchTools;

  constructor(config: RunnerConfig) {
    this.config = config;
    this.fileTools = new FileTools(config);
    this.terminalTools = new TerminalTools(config);
    this.gitTools = new GitTools(config);
    this.skillTools = new SkillTools(config);
    this.searchTools = new SearchTools(config);
  }

  async execute(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<{ content: Array<{ type: string; text: string }>; isError: boolean }> {
    switch (toolName) {
      case "read_file":
        return this.fileTools.readFile(args);
      case "write_file":
        return this.fileTools.writeFile(args);
      case "edit_file":
        return this.fileTools.editFile(args);
      case "list_files":
        return this.fileTools.listFiles(args);
      case "delete_file":
        return this.fileTools.deleteFile(args);
      case "run_command":
        return this.terminalTools.runCommand(args);
      case "git_status":
        return this.gitTools.status(args);
      case "git_diff":
        return this.gitTools.diff(args);
      case "git_log":
        return this.gitTools.log(args);
      case "git_commit":
        return this.gitTools.commit(args);
      case "list_skills":
        return this.skillTools.listSkills();
      case "get_skill":
        return this.skillTools.getSkill(args);
      case "search_files":
        return this.searchTools.searchFiles(args);
      case "grep_files":
        return this.searchTools.grepFiles(args);
      case "get_status":
        return this.getStatus();
      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${toolName}` }],
          isError: true,
        };
    }
  }

  private async getStatus(): Promise<{
    content: Array<{ type: string; text: string }>;
    isError: boolean;
  }> {
    const status = {
      deviceName: this.config.deviceName,
      deviceId: this.config.deviceId,
      platform: process.platform,
      version: "0.1.0",
      projectDir: this.config.projectDir,
      requireApproval: this.config.requireApproval,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
      isError: false,
    };
  }
}
