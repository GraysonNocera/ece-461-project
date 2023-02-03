"use strict";
fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
        "Authorization": `Token ${process.env.GITHUB_TOKEN}`
    }
}).then(data => data.json).then(console.log);
//# sourceMappingURL=GraphQL_Introspection_Query.js.map