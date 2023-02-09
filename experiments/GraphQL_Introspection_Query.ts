// Introspection query for GraphQL
// Will return a list of data you can query from the API

export {};

function sleep(ms: number) {
  // On the one hand, don't use it. On the other, I spent 3 hours (no joke) debugging
  // a race condition that could have been fixed with ```await sleep(500)```.
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mg() {
  var data;
  fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.GITHUB_TOKEN}`,
    },
  }).then((data) => data.json());

  await sleep(3000);
  console.log(data);
}

mg();
