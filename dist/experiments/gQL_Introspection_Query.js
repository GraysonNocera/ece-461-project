"use strict";
fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
        "Authorization": `Token ${process.env.GITHUB_TOKEN}`
    }
}).then(data => data.json)
    .then(data => {
    console.log(data);
    let str = JSON.stringify(data, null, 4);
    fs.writeFile("Introspection_Query.json", str, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("API Return Saved to File");
        }
    });
});
//# sourceMappingURL=gQL_Introspection_Query.js.map