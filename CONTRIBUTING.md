# Contributing to SurfSense

Hey! 👋 Thanks for checking out **SurfSense**. We're stoked that you're interested in helping improve the project. Whether it's fixing bugs, suggesting features, improving docs, or just joining the conversation — every bit helps.

## 🧠 Before You Start

**Join Our Discord**  
Want to stay in the loop, ask questions, or get feedback before starting something?  
Hop into the official SurfSense community:  
👉 [https://discord.gg/ejRNvftDp9](https://discord.gg/ejRNvftDp9)

That's where the *latest updates*, *internal discussions*, and *collaborations* happen.

## 📌 What Can You Work On?

There are 3 main ways to contribute:

### ✅ 1. Pick From the Roadmap
We maintain a public roadmap with well-scoped issues and features you can work on:  
🔗 [SurfSense GitHub Project Roadmap](https://github.com/users/MODSetter/projects/2)

> 💡 **Tip**: Look for tasks in `Backlog` or `Ready` status.

### 💡 2. Propose Something New
Have an idea that's not on the roadmap?

1. First, check for an existing issue
2. If it doesn't exist, create a new issue explaining your feature or enhancement
3. Wait for feedback from maintainers
4. Once approved, you're welcome to start working on a PR!

### 🐞 3. Report Bugs or Fix Them
Found a bug? Create an issue with:

- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Environment details** (OS, browser, version)
- **Any relevant logs or screenshots**

Want to fix it? Go for it! Just link the issue in your PR.

## 🛠️ Development Setup

### Prerequisites
- **Docker & Docker Compose** (recommended) OR manual setup
- **Node.js** (v18+ for web frontend)
- **Python** (v3.11+ for backend)
- **PostgreSQL** with **PGVector** extension
- **API Keys** for external services you're testing

### Quick Start
1. **Clone the repository**
   ```bash
   git clone https://github.com/MODSetter/SurfSense.git
   cd SurfSense
   ```

2. **Choose your setup method**:
   - **Docker Setup**: Follow the [Docker Setup Guide](./DOCKER_SETUP.md)
   - **Manual Setup**: Follow the [Installation Guide](https://www.surfsense.net/docs/)

3. **Configure services**:
   - Set up PGVector & PostgreSQL
   - Configure a file ETL service: `Unstructured.io` or `LlamaIndex`
   - Add API keys for external services

For detailed setup instructions, refer to our [Installation Guide](https://www.surfsense.net/docs/).

### 🤖 Enhanced Development with PAL MCP (Optional)

For advanced contributors, consider using [PAL MCP (DASHI)](docs/PAL_MCP_INTEGRATION.md) to enhance your development workflow:

**Benefits:**
- **Multi-model code reviews** before committing
- **AI-powered debugging** with systematic investigation
- **Architecture planning** with consensus from multiple AI models
- **Extended thinking** for complex problem solving

**Quick Setup:**
```bash
# Install PAL MCP
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/DASHI.git
cd DASHI && ./run-server.sh

# Or add to SurfSense with Docker Compose
docker-compose -f docker-compose.yml -f docker-compose.pal.yml up
```

**Usage Examples:**
```
"Use pal codereview with multiple models to check this connector implementation"
"Get pal consensus from gemini-pro and gpt-5 on this architecture decision"
"Run pal precommit to validate changes before pushing"
```

See [PAL MCP Integration Guide](docs/PAL_MCP_INTEGRATION.md) for complete details.

## 🏗️ Project Structure

SurfSense consists of three main components:

- **`surfsense_backend/`** - Python/FastAPI backend service
- **`surfsense_web/`** - Next.js web application
- **`surfsense_browser_extension/`** - Browser extension for data collection

## 🧪 Development Guidelines

### Code Quality & Pre-commit Hooks
We use pre-commit hooks to maintain code quality, security, and consistency across the codebase. Before you start developing:

1. **Install and set up pre-commit hooks** - See our detailed [Pre-commit Guide](./PRE_COMMIT.md)
2. **Understand the automated checks** that will run on your code
3. **Learn about bypassing hooks** when necessary (use sparingly!)

### Code Style
- **Backend**: Follow Python PEP 8 style guidelines
- **Frontend**: Use TypeScript and follow the existing code patterns
- **Formatting**: Use the project's configured formatters (Black for Python, Prettier for TypeScript)

### Commit Messages
Use clear, descriptive commit messages:
```
feat: add document search functionality
fix: resolve pagination issue in chat history
docs: update installation guide
refactor: improve error handling in connectors
```

### Testing
- Write tests for new features and bug fixes
- Ensure existing tests pass before submitting
- Include integration tests for API endpoints

### Branch Naming
Use descriptive branch names:
- `feature/add-document-search`
- `fix/pagination-issue`
- `docs/update-contributing-guide`

## 🔄 Pull Request Process

### Before Submitting
1. **Create an issue** first (unless it's a minor fix)
2. **Fork the repository** and create a feature branch
3. **Make your changes** following the coding guidelines
4. **Test your changes** thoroughly
5. **Update documentation** if needed

### PR Requirements
- **One feature or fix per PR** - keep changes focused
- **Link related issues** in the PR description
- **Include screenshots or demos** for UI changes
- **Write descriptive PR title and description**
- **Ensure CI passes** before requesting review


## 🔍 Code Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **At least one maintainer** will review your PR
3. **Address feedback** promptly and professionally
4. **Squash commits** if requested to keep history clean
5. **Celebrate** when your PR gets merged! 🎉

## 📚 Documentation

When contributing, please:
- Update relevant documentation for new features
- Add or update code comments for complex logic
- Update API documentation for backend changes
- Add examples for new functionality

## 🆘 Getting Help

Stuck? Need clarification? Here's how to get help:

1. **Check existing issues** - your question might already be answered
2. **Search the docs** - [https://www.surfsense.net/docs/](https://www.surfsense.net/docs/)
3. **Ask in Discord** - [https://discord.gg/ejRNvftDp9](https://discord.gg/ejRNvftDp9)
4. **Create an issue** - if it's a bug or feature request

## ⭐ Other Ways to Contribute

Not ready to code? You can still help!

- **Give us a star** ⭐ on GitHub
- **Share SurfSense** with your community
- **Provide feedback** on Discord
- **Help triage issues** and validate bug reports
- **Improve documentation** and examples
- **Write tutorials** or blog posts about SurfSense
- **Contribute translations** - Help make SurfSense accessible to more users! See [TRANSLATIONS.md](TRANSLATIONS.md) for details on how to contribute translations. We welcome contributions to improve existing translations or add support for new languages.

## 🎯 Recognition

We appreciate all contributions! Contributors will be:
- **Acknowledged** in release notes
- **Listed** in our contributors section
- **Invited** to join our contributors' Discord channel
- **Eligible** for special contributor badges

## 📄 License

By contributing to SurfSense, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to SurfSense!** 🚀  
Together, we're building something awesome.





