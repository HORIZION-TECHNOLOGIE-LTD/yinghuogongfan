# PAL MCP Integration with SurfSense

## Overview

SurfSense can now be enhanced with [DASHI (PAL MCP)](https://github.com/HORIZION-TECHNOLOGIE-LTD/DASHI), a Provider Abstraction Layer that enables multi-model AI orchestration. This integration allows SurfSense to leverage multiple AI models for improved research quality, consensus-based decision making, and collaborative AI workflows.

## What is PAL MCP?

PAL MCP (Provider Abstraction Layer - Model Context Protocol) is a powerful MCP server that allows AI CLIs to:

- **Multi-Model Orchestration**: Consult multiple AI models (GPT-5, Gemini Pro, Claude, O3, local models) within a single workflow
- **Consensus Building**: Get expert opinions from multiple models to improve research accuracy
- **Extended Context**: Break through context limits by delegating to models with larger windows (Gemini 1M tokens)
- **Specialized Workflows**: Code review, debugging, planning, pre-commit validation, and more
- **Conversation Continuity**: Full context preserved across tools and models

## Benefits for SurfSense

Integrating PAL MCP with SurfSense provides:

1. **Enhanced Research Quality**: Multi-model consensus for more accurate and comprehensive research
2. **Better Decision Making**: Get second opinions from different AI models on research findings
3. **Extended Analysis**: Leverage extended thinking modes for complex research topics
4. **Code Quality**: Use PAL's code review and debugging tools for SurfSense development
5. **Smart Orchestration**: Automatically select the best AI model for each research subtask

## Integration Options

### Option 1: Standalone PAL MCP Server (Recommended)

Run PAL MCP as a separate service that SurfSense developers and users can connect to via AI CLIs like Claude Code or Cursor.

**Setup:**

```bash
# Clone PAL MCP
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/DASHI.git
cd DASHI

# Configure with your API keys
cp .env.example .env
# Edit .env with your Gemini, OpenAI, or other provider keys

# Run the server
./run-server.sh
```

**Usage with Claude Code:**

```
# In Claude Code, connected to SurfSense repository
"Use pal to get consensus from gemini pro and gpt-5 on implementing this feature"
"Ask pal to review the research agent code with multiple models"
"Use thinkdeep with max thinking mode to analyze this complex RAG query optimization"
```

### Option 2: Docker Compose Integration

Add PAL MCP as an optional service in SurfSense's docker-compose.yml for integrated deployment.

**Benefits:**
- Single deployment for both SurfSense and PAL MCP
- Shared environment configuration
- Easy startup/shutdown

**Implementation:**
See the example configuration in `docker-compose.pal.yml` included in this repository.

**Usage:**
```bash
# Start SurfSense with PAL MCP
docker-compose -f docker-compose.yml -f docker-compose.pal.yml up

# Or build with PAL MCP
docker-compose -f docker-compose.yml -f docker-compose.pal.yml up --build
```

### Option 3: Direct Integration (Advanced)

For advanced users, PAL MCP's multi-model orchestration logic could be integrated directly into SurfSense's LangGraph agents.

**Note:** This approach requires significant development work and is not recommended for most use cases.

## Use Cases

### 1. Multi-Model Research Validation

When researching complex topics, get consensus from multiple AI models:

```python
# In your research workflow
"Research quantum computing applications in drug discovery, 
then use pal consensus with gemini-pro and gpt-5 to validate findings"
```

### 2. Code Quality Assurance

Use PAL's code review tools when developing SurfSense features:

```
"Use pal codereview with multiple models to check this new connector implementation"
"Run pal precommit to validate changes before committing"
```

### 3. Complex Problem Solving

Leverage extended thinking modes for difficult architectural decisions:

```
"Use pal thinkdeep with max thinking mode to analyze scaling strategies for the RAG system"
"Get pal consensus from multiple models on database sharding approach"
```

### 4. API Documentation Lookup

Ensure your research agent uses current API documentation:

```
"Use pal apilookup to get current LangChain API for implementing streaming responses"
```

## Configuration

### Environment Variables

Add these optional variables to your `.env` if using PAL MCP:

```bash
# PAL MCP Configuration (Optional)
PAL_MCP_ENABLED=true
PAL_MCP_SERVER_URL=http://localhost:8080

# Multi-model API Keys (used by PAL MCP)
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
OPENROUTER_API_KEY=your-openrouter-key
ANTHROPIC_API_KEY=your-anthropic-key
```

### Global LLM Configuration

SurfSense already supports multiple LLM providers through LiteLLM. PAL MCP extends this by enabling:

- Multi-model consultation within a single workflow
- Automatic model selection based on task requirements
- Cross-model conversation continuity

## Architecture

```
┌─────────────────────────────────────────┐
│         User Interface                  │
│  (Web App / Browser Extension)          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      SurfSense Backend (FastAPI)        │
│  • Research Agent (LangGraph)           │
│  • RAG Pipeline (LangChain)             │
│  • Multiple LLM Support (LiteLLM)       │
└────────┬────────────────────────┬───────┘
         │                        │
         │                        │ (Optional)
         ▼                        ▼
┌──────────────────┐    ┌────────────────────┐
│  Direct LLM      │    │   PAL MCP Server   │
│  Providers       │    │  • Multi-Model     │
│  • OpenAI        │    │    Orchestration   │
│  • Anthropic     │    │  • Consensus       │
│  • Gemini        │    │  • Code Review     │
│  • Local Models  │    │  • Deep Thinking   │
└──────────────────┘    └────────────────────┘
```

## Getting Started

### Quick Start (5 minutes)

1. **Install PAL MCP** (if not already done):
   ```bash
   git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/DASHI.git
   cd DASHI
   ./run-server.sh
   ```

2. **Configure your AI CLI** (e.g., Claude Code):
   Follow PAL MCP's [setup guide](https://github.com/HORIZION-TECHNOLOGIE-LTD/DASHI/blob/main/docs/getting-started.md)

3. **Start using with SurfSense**:
   ```
   "Use pal to get gemini pro's opinion on this research agent optimization"
   ```

### Advanced Configuration

For production deployments, consider:

- Running PAL MCP behind a reverse proxy
- Setting up authentication for the MCP server
- Configuring rate limits and quotas
- Monitoring multi-model API usage

## Best Practices

1. **Use Consensus for Critical Decisions**: When making important architectural or research decisions, get consensus from multiple models

2. **Leverage Extended Thinking**: Use `thinkdeep` with high or max thinking mode for complex problems

3. **Model Selection**: Let Claude or your primary AI orchestrate model selection, or specify explicitly:
   - Gemini Pro: Large context (1M tokens), extended thinking
   - GPT-5: Strong reasoning, balanced performance
   - Local models: Privacy-focused, zero API cost

4. **Code Reviews**: Always run `precommit` before pushing changes to SurfSense

5. **API Lookups**: Use `apilookup` when implementing new features to ensure current API usage

## Troubleshooting

### PAL MCP Not Responding

1. Check if the PAL MCP server is running
2. Verify API keys are configured correctly
3. Check firewall settings if running remotely

### Context Too Large Errors

1. Use PAL's automatic chunking for large prompts
2. Delegate to Gemini Pro for extended context (1M tokens)
3. Break down the task into smaller subtasks

### Model Selection Issues

1. Let the AI orchestrate automatically unless you have specific needs
2. Use `listmodels` to see available models
3. Check provider API status if a specific model fails

## References

- [PAL MCP GitHub Repository](https://github.com/HORIZION-TECHNOLOGIE-LTD/DASHI)
- [PAL MCP Documentation](https://github.com/HORIZION-TECHNOLOGIE-LTD/DASHI/blob/main/docs/index.md)
- [Model Context Protocol](https://modelcontextprotocol.com)
- [SurfSense Documentation](https://www.surfsense.net/docs/)

## Contributing

If you have ideas for deeper integration between SurfSense and PAL MCP, please:

1. Open an issue on the SurfSense repository
2. Share your use cases and workflows
3. Contribute integration code via pull requests

## License

This integration guide is part of SurfSense and is licensed under the Apache 2.0 License.
PAL MCP is separately licensed under Apache 2.0 License.
