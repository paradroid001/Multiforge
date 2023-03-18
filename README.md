# Multiforge
A distributed procedural content generation framework and workflow

TODO:
- 14/02/2023: Have two different 'screens'/views - one for "forge" nodes / graphs, the other for "meta" nodes / edges / graphs.
- Need to be able to author meta nodes and edges, so the logic is a little different from forge: there need to be calls to the backend to create properties etc.
- Forge graphs need query nodes or some other nodes that can query the meta system. These can validate that all the names / query params are spelled correctly etc.
- The meta graph system should be queryable / testable independently of the frontend: I should be able to run queries and test the system with 'authored' nodes just through the web api.
