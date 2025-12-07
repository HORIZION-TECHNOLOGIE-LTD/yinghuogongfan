# PAL MCP Quick Reference for SurfSense Users

This is a quick reference guide for using PAL MCP with SurfSense. For complete details, see [PAL_MCP_INTEGRATION.md](PAL_MCP_INTEGRATION.md).

## What You Can Do

### 1. Get Multi-Model Consensus on Research

When researching complex topics, consult multiple AI models:

```
"Research the latest trends in vector databases, then use pal consensus 
with gemini-pro and gpt-5 to validate the findings"
```

### 2. Extended Thinking for Complex Analysis

Use deep thinking modes for thorough analysis:

```
"Use pal thinkdeep with max thinking mode to analyze the best approach 
for implementing real-time collaborative features in SurfSense"
```

### 3. Code Review Before Committing

Get AI-powered code reviews:

```
"Use pal codereview with multiple models to check this new connector implementation"
"Run pal precommit to validate all changes before pushing"
```

### 4. Debug Complex Issues

Systematic debugging with hypothesis tracking:

```
"Use pal debug to investigate why the RAG query is returning inconsistent results"
```

### 5. Plan Large Features

Break down complex work into structured plans:

```
"Use pal planner to create a detailed implementation plan for adding 
real-time search to the research agent"
```

## Common Commands

### Multi-Model Chat
```
"Chat with gemini-pro about optimizing the embedding pipeline"
"Continue with gpt-5 to implement the recommended changes"
```

### Consensus Building
```
"Get pal consensus from gemini-pro, gpt-5, and claude on the best caching strategy"
```

### API Documentation Lookup
```
"Use pal apilookup for the latest LangChain streaming API"
```

### Challenge Assumptions
```
"Use pal challenge to critically analyze this database schema design"
```

### CLI-to-CLI Bridge
```
"clink with gemini role=codereviewer to audit the authentication module"
"clink with codex role=planner to draft a migration strategy"
```

## Model Selection Guide

**Let AI Choose (Recommended):**
```
"Use pal with auto model selection to optimize the RAG pipeline"
```

**Specify Models:**
```
"Use pal with gemini-pro to analyze this large codebase"  # Large context
"Use pal with gpt-5 for detailed reasoning on this architecture"  # Strong reasoning
"Use pal with flash for quick syntax checks"  # Speed
"Use pal with ollama/llama3 for privacy-critical analysis"  # Local/Private
```

## Best Practices

### 1. Research Quality
- Use consensus from 2-3 models for critical research
- Leverage extended thinking for complex topics
- Validate findings with multiple perspectives

### 2. Code Development
- Run `precommit` before every git commit
- Use `codereview` for new features
- Get multi-model opinions on architectural decisions

### 3. Context Management
- Delegate to Gemini Pro for large context (1M tokens)
- Use conversation continuity for complex workflows
- Context carries forward across tools and models

### 4. Model Selection
- **Gemini Pro**: Large context, extended thinking, research
- **GPT-5**: Strong reasoning, balanced performance
- **Flash**: Speed, quick checks, iterations
- **O3**: Deep analysis, mathematical reasoning
- **Local Models**: Privacy, zero cost

## Integration Checklist

- [ ] Install PAL MCP server
- [ ] Configure API keys in `.env`
- [ ] Set up AI CLI (Claude Code, Cursor, etc.)
- [ ] Test basic `chat` command
- [ ] Try `consensus` with multiple models
- [ ] Run `codereview` on sample code
- [ ] Configure default models and tools

## Troubleshooting

**PAL MCP not responding:**
- Check if server is running: `curl http://localhost:8080/health`
- Verify API keys are set
- Check logs: `docker logs surfsense_pal_mcp`

**Context too large:**
- Use Gemini Pro for extended context
- Break tasks into smaller subtasks
- PAL handles automatic chunking

**Model not available:**
- Check API key for that provider
- Use `listmodels` to see available models
- Try alternative provider

## Resources

- [Full Integration Guide](PAL_MCP_INTEGRATION.md)
- [PAL MCP (DASHI) GitHub Repository](https://github.com/HORIZION-TECHNOLOGIE-LTD/DASHI)
- PAL MCP Documentation - See DASHI repository for latest tools and setup
- [SurfSense Documentation](https://www.surfsense.net/docs/)

**Note**: Refer to DASHI repository README for the most current documentation and tool details.

## Example Workflows

### Workflow 1: Feature Development with Multi-Model Review
```
1. "Use pal planner to break down adding Discord integration"
2. [Implement the feature]
3. "Use pal codereview with gemini-pro and gpt-5 to review the implementation"
4. [Fix identified issues]
5. "Run pal precommit to validate before committing"
```

### Workflow 2: Research with Consensus Validation
```
1. "Research emerging AI embedding models for RAG systems"
2. "Use pal consensus with gemini-pro, gpt-5, and claude to evaluate the findings"
3. "Get pal thinkdeep with max mode to analyze trade-offs"
4. "Continue with gemini-pro to create migration plan"
```

### Workflow 3: Debugging with Systematic Analysis
```
1. "Use pal debug to investigate the memory leak in document processing"
2. "Continue with gpt-5 to validate the hypothesis"
3. "Use pal thinkdeep to consider edge cases"
4. [Implement fix]
5. "Use pal precommit to ensure no regressions"
```

---

**Remember:** PAL MCP enhances SurfSense by providing multi-model AI orchestration. You're still in control—PAL helps you leverage the best AI for each task.
