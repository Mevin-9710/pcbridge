# PCBridge Skills

Skills are reusable instruction sets that guide the agent's behavior on specific tasks.

## Available Skills

### code-review
Review code for bugs, style issues, and improvements.

### debug
Systematic debugging approach — reproduce, isolate, fix, test.

### refactor
Safely restructure code without changing behavior.

### test-generation
Generate unit and integration tests for existing code.

## Usage

Skills are automatically available to the agent. They provide structured workflows for common coding tasks.

## Creating Custom Skills

Create a `.md` file in this directory with:

```markdown
# Skill Name

## Instructions
Step-by-step guidance for the agent.

## Examples
Example inputs and expected outputs.
```
