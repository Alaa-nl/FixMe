# FixMe Claude Configuration

This directory contains skills and plugins to enhance Claude's capabilities when working on the FixMe project.

## Available Skills

Skills are specialized instructions that Claude loads dynamically to improve performance on specific tasks.

### Design & Frontend
- **frontend-design** - Create distinctive, production-grade frontend interfaces with high design quality
- **canvas-design** - Design and create canvas-based graphics and interactive visualizations
- **theme-factory** - Create and manage consistent design themes

### Development & Testing
- **webapp-testing** - Automated testing strategies for web applications

## Available Plugins

Plugins extend Claude Code's functionality with specialized tools and workflows.

### Code Quality & Review
- **code-review** - Comprehensive code review and analysis
- **pr-review-toolkit** - Pull request review automation and best practices
- **security-guidance** - Security analysis and vulnerability detection

### Development Workflows
- **feature-dev** - Structured feature development workflow
- **frontend-design** - Frontend design and implementation workflow

## Usage

### Using Skills
Skills are automatically available when working in this repository. Just mention them in your request:
- "Use the frontend-design skill to create a dashboard"
- "Use webapp-testing to create tests for the login component"

### Using Plugins
Plugins can be invoked with their specific commands. Check each plugin's documentation for available commands.

## Tech Stack Context

- **Framework**: Next.js 14+ (App Router)
- **UI Library**: shadcn/ui components (available in `/ui` directory)
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM with PostgreSQL
- **TypeScript**: Strict mode enabled
- **Animation**: Framer Motion
- **Testing**: (to be configured)

## Resources

### External Repositories (cloned in project root)
- **skills/** - Full Anthropic skills repository
- **claude-code/** - Claude Code examples and plugins
- **ui/** - shadcn/ui component library source

## Customization

You can add more skills or plugins by:
1. Creating a new directory in `.claude/skills/` or `.claude/plugins/`
2. Adding a `SKILL.md` or appropriate plugin files
3. Following the [Agent Skills specification](https://agentskills.io)

## Best Practices

1. **Frontend Design**: Always use distinctive typography and avoid generic aesthetics (see CLAUDE.md)
2. **Code Review**: Run code-review plugin before PRs
3. **Security**: Use security-guidance plugin when handling auth or sensitive data
4. **Testing**: Leverage webapp-testing skill for comprehensive test coverage
5. **Theming**: Use theme-factory for consistent design systems
