# FixMe Project Integration Guide

## Overview
This guide explains all the skills, plugins, and resources integrated into the FixMe project to enhance development with Claude.

## Project Structure

```
FixMe/
├── .claude/                    # Claude configuration directory
│   ├── skills/                 # Specialized instruction sets
│   │   ├── frontend-design/    # UI design & implementation
│   │   ├── canvas-design/      # Canvas graphics
│   │   ├── theme-factory/      # Design system creation
│   │   └── webapp-testing/     # Testing strategies
│   ├── plugins/                # Claude Code plugins
│   │   ├── code-review/        # Code quality analysis
│   │   ├── feature-dev/        # Feature development workflow
│   │   ├── frontend-design/    # Frontend workflow plugin
│   │   ├── pr-review-toolkit/  # PR review automation
│   │   └── security-guidance/  # Security analysis
│   ├── README.md              # Skills & plugins overview
│   └── INTEGRATION_GUIDE.md   # This file
├── CLAUDE.md                  # Frontend aesthetics guidelines
├── components.json            # shadcn/ui configuration
├── skills/                    # Full Anthropic skills repo (reference)
├── claude-code/              # Claude Code examples (reference)
└── ui/                       # shadcn/ui source (reference)
```

## Integrated Skills

### 1. Frontend Design Skill
**Location**: `.claude/skills/frontend-design/`
**Purpose**: Create distinctive, production-grade frontend interfaces

**Key Features**:
- Bold aesthetic direction selection
- Creative typography choices
- Cohesive color systems
- Motion and animation guidance
- Anti-generic-AI-design principles

**Usage**:
```
"Use the frontend-design skill to create a dashboard"
"Apply frontend-design principles to redesign the login page"
```

### 2. Canvas Design Skill
**Location**: `.claude/skills/canvas-design/`
**Purpose**: Create canvas-based graphics and interactive visualizations

**Usage**:
```
"Use canvas-design to create an interactive chart"
"Create a canvas-based diagram of the system architecture"
```

### 3. Theme Factory Skill
**Location**: `.claude/skills/theme-factory/`
**Purpose**: Create and manage consistent design themes

**Usage**:
```
"Use theme-factory to create a dark mode theme"
"Generate a cohesive color system for the app"
```

### 4. Web App Testing Skill
**Location**: `.claude/skills/webapp-testing/`
**Purpose**: Automated testing strategies for web applications

**Usage**:
```
"Use webapp-testing to create tests for the auth flow"
"Set up E2E tests using webapp-testing guidelines"
```

## Integrated Plugins

### 1. Code Review Plugin
**Location**: `.claude/plugins/code-review/`
**Purpose**: Comprehensive code review and analysis

**Use Before**:
- Committing major changes
- Creating pull requests
- Merging to main branch

### 2. Feature Development Plugin
**Location**: `.claude/plugins/feature-dev/`
**Purpose**: Structured feature development workflow

**Use When**:
- Starting new features
- Need organized development approach
- Planning complex implementations

### 3. Frontend Design Plugin
**Location**: `.claude/plugins/frontend-design/`
**Purpose**: Frontend design and implementation workflow

**Use For**:
- New UI component creation
- Page design and implementation
- Design system updates

### 4. PR Review Toolkit
**Location**: `.claude/plugins/pr-review-toolkit/`
**Purpose**: Pull request review automation

**Use For**:
- Reviewing teammate PRs
- Pre-merge checks
- Code quality assurance

### 5. Security Guidance Plugin
**Location**: `.claude/plugins/security-guidance/`
**Purpose**: Security analysis and vulnerability detection

**Use When**:
- Implementing authentication
- Handling sensitive data
- API endpoint creation
- Database schema changes

## shadcn/ui Integration

### Configuration
shadcn/ui is configured with:
- **Style**: New York
- **Base Color**: Neutral
- **Icon Library**: Lucide React
- **CSS Variables**: Enabled
- **TypeScript**: Enabled
- **React Server Components**: Enabled

### Component Installation
Install additional components as needed:
```bash
npx shadcn@latest add [component-name]
```

### Available Component Categories
- **Forms**: button, input, label, textarea, select, checkbox, radio-group, switch
- **Data Display**: card, table, badge, avatar
- **Overlays**: dialog, dropdown-menu
- **Navigation**: tabs
- **Feedback**: sonner (toast notifications)

### Custom Components
Existing custom components in `src/components/ui/`:
- Button.tsx
- Input.tsx
- Modal.tsx
- Toggle.tsx

## Reference Repositories

Three repositories are cloned in the project root for reference:

### 1. `/skills/` - Anthropic Skills Repository
Full collection of official Anthropic skills. Browse for ideas and patterns.

**Additional Skills Available**:
- algorithmic-art
- brand-guidelines
- doc-coauthoring
- docx, pdf, pptx, xlsx (document skills)
- internal-comms
- mcp-builder
- skill-creator
- slack-gif-creator
- web-artifacts-builder

### 2. `/claude-code/` - Claude Code Repository
Examples, documentation, and additional plugins.

**Additional Plugins Available**:
- agent-sdk-dev
- commit-commands
- explanatory-output-style
- learning-output-style
- plugin-dev
- hookify (hook development)

### 3. `/ui/` - shadcn/ui Source
Full source code of shadcn/ui for deep dives and customization.

## Frontend Aesthetics Guidelines

### Core Principles (from CLAUDE.md)
1. **Typography First**: Use distinctive fonts (never Inter, Roboto, Arial)
2. **Bold Color Choices**: Dominant colors with sharp accents
3. **Thoughtful Motion**: High-impact animations, CSS-first approach
4. **Atmospheric Backgrounds**: Layer gradients, patterns, textures
5. **Avoid Generic AI Aesthetics**: No purple gradients on white, no cookie-cutter layouts

### Recommended Font Combinations
- **Code Aesthetic**: JetBrains Mono, Fira Code, Space Grotesk
- **Editorial**: Playfair Display, Crimson Pro, Fraunces
- **Startup**: Clash Display, Satoshi, Cabinet Grotesk
- **Technical**: IBM Plex family, Source Sans 3
- **Distinctive**: Bricolage Grotesque, Obviously, Newsreader

### Animation Guidelines
- Prefer CSS-only animations
- Use Framer Motion for complex React animations
- Focus on page load orchestration
- Use animation-delay for staggered reveals
- Prioritize micro-interactions on hover/focus

## Development Workflow

### Starting a New Feature
1. Use **feature-dev** plugin for structured approach
2. Apply **frontend-design** skill for UI components
3. Run **code-review** before committing
4. Use **security-guidance** for sensitive code
5. Apply **pr-review-toolkit** before creating PR

### UI Development Best Practices
1. Start with **theme-factory** for color system
2. Use **frontend-design** skill for unique aesthetics
3. Install shadcn components as needed
4. Apply custom styling with Tailwind
5. Add animations with CSS or Framer Motion

### Testing Strategy
1. Use **webapp-testing** skill for test planning
2. Implement unit tests for business logic
3. Create integration tests for API endpoints
4. Add E2E tests for critical user flows
5. Test on multiple devices/browsers

### Security Checklist
1. Run **security-guidance** plugin on:
   - Authentication code
   - API endpoints
   - Database queries
   - File uploads
   - User input handling
2. Review dependencies regularly
3. Implement proper error handling
4. Use environment variables for secrets
5. Validate all user inputs

## Next Steps

### To Copy Additional Skills
```bash
cp -r skills/skills/[skill-name] .claude/skills/
```

### To Copy Additional Plugins
```bash
cp -r claude-code/plugins/[plugin-name] .claude/plugins/
```

### To Install More shadcn Components
```bash
npx shadcn@latest add [component-name]
```

### To Create Custom Skills
1. Copy `.claude/skills/template/` (if exists)
2. Create `SKILL.md` with frontmatter
3. Add instructions and examples
4. Test with Claude

## Resources

- [Agent Skills Specification](https://agentskills.io)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Framer Motion Documentation](https://www.framer.com/motion)

## Troubleshooting

### Skills Not Working
- Ensure skill has proper `SKILL.md` with frontmatter
- Check skill name in frontmatter matches directory name
- Verify Claude has access to `.claude` directory

### Plugins Not Available
- Check plugin structure matches expected format
- Verify plugin files have correct permissions
- Consult plugin's README for requirements

### shadcn Components Not Found
- Run `npx shadcn@latest add [component]`
- Check `components.json` configuration
- Verify import paths match aliases

### Styling Issues
- Check Tailwind config is up to date
- Verify CSS variables in `globals.css`
- Review component imports from `@/components/ui`

## Support

For issues or questions:
1. Check plugin/skill README files
2. Review integration guide (this file)
3. Consult reference repositories in project root
4. Refer to official documentation links above
