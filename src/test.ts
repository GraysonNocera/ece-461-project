import axios from 'axios';

interface Repository {
  name: string;
  description: string;
  forks: number;
  stargazers_count: number;
}

async function getRepositories(username:string): Promise<Repository[]> {
  try {
    const response = await axios.get<Repository[]>(`https://api.github.com/users/$b4yuan/repos`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

getRepositories('username').then(repositories => console.log(repositories));