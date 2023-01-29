// Graph QL has something called Introspection which allows you to see what data can be queried
// Watch 5 minutes from 20:13 for context -> https://www.youtube.com/watch?v=fVmQCnQ_EPs
fetch ("https://api.github.com/graphql", 
    {
        method: "GET",
        headers: {
            "Authorization" : `Token ${process.env.GITHUB_TOKEN}`
        }
    }
).then (data => data.json()).then(console.log)