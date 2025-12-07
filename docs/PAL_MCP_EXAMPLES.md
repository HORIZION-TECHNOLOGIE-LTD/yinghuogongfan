# PAL MCP Integration Examples for SurfSense

This document provides practical examples of using PAL MCP (DASHI) with SurfSense for enhanced AI capabilities.

## Prerequisites

- SurfSense running locally or in Docker
- PAL MCP server installed and configured
- AI CLI (Claude Code, Cursor, or similar) connected to PAL MCP
- At least one AI provider configured (Gemini, OpenAI, etc.)

## Example 1: Multi-Model Research Validation

**Scenario:** You're researching RAG optimization strategies and want validation from multiple AI models.

### Without PAL MCP
```
User: "Research the latest RAG optimization techniques"
AI: [Provides research based on single model]
```

### With PAL MCP
```
User: "Research the latest RAG optimization techniques, then use pal consensus 
with gemini-pro and gpt-5 to validate and rank the findings"

AI: [Initial research] → 
    [Gemini Pro validates] → 
    [GPT-5 provides second opinion] → 
    [Combined consensus with confidence scores]

Result: More reliable research with multiple expert validations
```

## Example 2: Code Review Before Committing

**Scenario:** You've implemented a new Slack connector for SurfSense and want thorough review.

```
User: "I've added the new Slack connector in surfsense_backend/app/connectors/slack.py.
Use pal codereview with gemini-pro and claude to review the implementation"

PAL MCP: 
1. Analyzes the code with Gemini Pro
2. Gets Claude's perspective
3. Compiles findings with severity levels (critical, high, medium, low)
4. Provides actionable recommendations

User: [Fixes identified issues]

User: "Run pal precommit to validate changes"

PAL MCP:
- Checks for regressions
- Validates tests
- Ensures code quality
- Confirms security practices

Result: High-quality code with multi-model validation
```

## Example 3: Architecture Decision Making

**Scenario:** Deciding between different caching strategies for the RAG system.

```
User: "I need to decide between Redis, Memcached, and in-memory caching 
for the embedding cache. Use pal with gemini-pro to analyze the options"

Gemini Pro: [Analyzes with large context, considers SurfSense architecture]

User: "Now get consensus from gpt-5 and claude on the recommendation"

PAL MCP:
- GPT-5: [Provides reasoning from different angle]
- Claude: [Adds security and scalability perspective]
- Combines all insights into unified recommendation

User: "Use pal planner to create implementation plan for the chosen approach"

Result: Well-reasoned decision with implementation roadmap
```

## Example 4: Complex Bug Investigation

**Scenario:** Memory leak in the document processing pipeline.

```
User: "There's a memory leak in the celery worker when processing large PDFs.
Use pal debug with max thinking mode to investigate"

PAL MCP:
1. Systematic investigation with hypothesis tracking
2. Analyzes code paths
3. Identifies potential causes with confidence levels
4. Suggests verification steps

User: "Continue with gpt-5 to validate the hypothesis"

GPT-5: [Validates analysis, suggests additional checks]

User: "Use pal thinkdeep to analyze edge cases"

PAL MCP: [Deep analysis of edge cases and race conditions]

Result: Root cause identified with high confidence
```

## Example 5: Feature Planning with Multi-Model Input

**Scenario:** Planning real-time collaboration features for SurfSense.

```
User: "Plan implementation of real-time collaborative research features.
Use pal planner with gemini-pro for the initial plan"

PAL MCP: [Creates structured plan with phases]

User: "Get pal consensus from gpt-5 and claude on the technical approach"

PAL MCP:
- Presents plan to multiple models
- Collects feedback and concerns
- Identifies potential issues
- Refines plan based on consensus

User: "Use pal thinkdeep on the WebSocket scaling strategy"

PAL MCP: [Extended thinking on scaling challenges]

Result: Comprehensive plan validated by multiple AI experts
```

## Example 6: API Documentation Lookup

**Scenario:** Implementing streaming responses in the research agent.

```
User: "Use pal apilookup to get the latest LangChain streaming API documentation"

PAL MCP:
- Searches current documentation (not training data)
- Provides up-to-date API examples
- Shows best practices
- Includes recent changes

Result: Implementation with current API (not outdated from training data)
```

## Example 7: Research Agent Enhancement

**Scenario:** Optimizing the SurfSense research agent with multi-model insights.

```
User: "Analyze the research agent in surfsense_backend/app/agents/researcher/
and use pal with auto model selection to suggest optimizations"

PAL MCP:
1. Auto-selects appropriate model (e.g., Gemini Pro for large context)
2. Analyzes agent architecture
3. Identifies bottlenecks
4. Suggests improvements

User: "Get consensus from gpt-5 and claude on the recommendations"

PAL MCP: [Multi-model validation of suggestions]

User: "Use pal planner to create implementation strategy"

Result: Optimized research agent with validated improvements
```

## Example 8: Security Audit

**Scenario:** Auditing authentication implementation.

```
User: "Use pal secaudit to audit the authentication module in 
surfsense_backend/app/users.py"

PAL MCP:
- OWASP Top 10 analysis
- Token handling review
- Session management check
- SQL injection vulnerability scan
- XSS vulnerability check

User: "Get second opinion from gpt-5"

GPT-5: [Additional security perspective]

Result: Comprehensive security audit with multiple expert reviews
```

## Example 9: Extended Context Analysis

**Scenario:** Analyzing the entire SurfSense codebase for architectural patterns.

```
User: "Use pal analyze with gemini-pro to map the entire SurfSense architecture"

PAL MCP:
- Leverages Gemini's 1M token context
- Maps component relationships
- Identifies patterns
- Documents dependencies
- Suggests improvements

Result: Comprehensive architectural analysis that exceeds typical context limits
```

## Example 10: Collaborative Feature Implementation

**Scenario:** Implementing a feature with step-by-step validation.

```
User: "I need to add Elasticsearch connector. Let's use pal to help:
1. First, use planner to break down the work
2. Get consensus from multiple models on the approach
3. Implement with periodic precommit checks
4. Final codereview before merge"

PAL MCP Workflow:
1. Planner: [Breaks down into phases]
2. Consensus: [Validates approach]
3. Implementation with checkpoints
4. PreCommit: [Validates each checkpoint]
5. CodeReview: [Final multi-model review]

Result: High-quality implementation with continuous validation
```

## Integration Patterns

### Pattern 1: Research → Validate → Implement
```
1. Research with main AI
2. Validate with pal consensus
3. Plan with pal planner
4. Implement
5. Review with pal codereview
6. Validate with pal precommit
```

### Pattern 2: Investigate → Analyze → Fix
```
1. Debug with pal debug
2. Deep analysis with pal thinkdeep
3. Validate hypothesis with second model
4. Implement fix
5. Verify with pal precommit
```

### Pattern 3: Plan → Consensus → Execute
```
1. Initial plan with pal planner
2. Get pal consensus from multiple models
3. Refine based on feedback
4. Execute with validation checkpoints
```

## Tips for Effective Use

1. **Start Broad, Then Deep**
   - Use regular research/analysis first
   - Bring in PAL for validation and deep dives
   - Use consensus for critical decisions

2. **Model Selection**
   - Let PAL auto-select for most tasks
   - Specify Gemini Pro for large context
   - Use GPT-5 for strong reasoning
   - Use Flash for quick iterations

3. **Context Preservation**
   - PAL maintains conversation context across tools
   - Reference previous analysis naturally
   - Models remember what others suggested

4. **Validation Workflow**
   - Always run precommit before pushing
   - Use codereview for new features
   - Get consensus on architectural decisions

5. **Cost Optimization**
   - Use auto model selection (chooses cheapest capable model)
   - Disable unused tools in PAL configuration
   - Use local models for privacy/cost-sensitive tasks

## Measuring the Impact

### Before PAL MCP
- Single model perspective
- Limited by model's context window
- No easy multi-model validation
- Manual code review process

### After PAL MCP
- Multiple expert validations
- Extended context capabilities (Gemini 1M tokens)
- Automated consensus building
- Systematic code review workflow
- Higher confidence in decisions

## Next Steps

1. Install PAL MCP (see [PAL_MCP_INTEGRATION.md](PAL_MCP_INTEGRATION.md))
2. Configure your preferred AI providers
3. Try the examples above with your own use cases
4. Integrate PAL into your workflow
5. Share your experiences and use cases

## Resources

- [PAL MCP Integration Guide](PAL_MCP_INTEGRATION.md)
- [PAL MCP Quick Reference](PAL_MCP_QUICK_REFERENCE.md)
- [PAL MCP (DASHI) GitHub Repository](https://github.com/HORIZION-TECHNOLOGIE-LTD/DASHI)
- [SurfSense Documentation](https://www.surfsense.net/docs/)

**Note**: For the latest PAL MCP tools, commands, and documentation, refer to the DASHI repository.

---

**Remember:** PAL MCP makes SurfSense smarter by enabling multi-model AI orchestration. You maintain full control while leveraging the best AI for each task.
