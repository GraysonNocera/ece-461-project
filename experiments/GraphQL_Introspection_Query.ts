// Introspection query for GraphQL
// Will return a list of data you can query from the API

fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
        "Authorization" : `Token ${process.env.GITHUB_TOKEN}`
    }
}).then (data=>data.json).then(console.log)