# github-mcp-server

## Problem

LLMs can't see your GitHub data. Their knowledge is fixed at training time, so they know nothing about your repositories, your pull requests and what changed. Asking "which PRs are waiting for review on my repo?" would give you a guess at best, refusal at worst.

To work around this you'd have to either: 
- **Copy-paste or screenshot into the chat** which is manual and only valid for that moment in time. Doesn't scale beyond a few times.
- **Costumize integration for each of your AI apps** and write the same code to authenticate, handle rate limits, handle errors, and response formats. Done for every app that needs GitHub access.

At some point you will need a reliable way for an AI application to query live GitHub data safely and without per-app integration work.

## Why MCP 

The Model Context Protocol (MCP) fits this exact problem, since it is an open standard for connecting AI applications to external tools and data sources.

- **Build once, use everywhere**. This server works with any MCP compatible client without changes. 
- **Can act on errors reliably**. Failures are returned as tool results with clear messages for the model to treat it as intended.
- **Self-describing tools**. The model knows what's available, what each tool does and how to call each one without hardcoded instructions.
- **Safe by design**. Tools are labeled read-only so the client knows that they can't modify on GitHub. or write to give access but use the tool with caution.
- **Local with no extra steps**. The server runs on your machine over stdio. Your GitHub token stays in the server's environment and never sent to the model.

## Architecture (TBD)

## Tools (TBD)

## How to run (TBD)

## Resources 

- What is Model Context Protocol : https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro
- introducing the Model Context Protocol : https://www.anthropic.com/news/model-context-protocol 
- build an MCP server : https://modelcontextprotocol.io/docs/2026-07-28/develop/build-server
- NetworkChuck video about MCP : https://www.youtube.com/watch?v=GuTcle5edjk (Build your own MCP server @12:31 and MCP Gateway, Explained @32:51)
- MCP gateway : https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/
- JSON-RPC Specification : https://www.jsonrpc.org/specification
- MCP server concepts : Tools vs Resources vs Prompts : https://modelcontextprotocol.io/docs/learn/server-concepts
- Understanding MCP servers transports : https://dev.to/zoricic/understanding-mcp-server-transports-stdio-sse-and-http-streamable-5b1p
- Permission level per REST endpoint in GitHub : https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens?apiVersion=2026-03-10
- MCP Typescript SDK v2 : https://ts.sdk.modelcontextprotocol.io/v2/
- MCP inspector : https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector
- GitHub REST endpoints : https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10
- Octokit library to utilize GitHub's REST API : https://github.com/octokit/octokit.js#readme