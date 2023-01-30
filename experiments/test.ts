import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface Repository {
  name: string;
  description: string;
  forks: number;
  stargazers_count: number;
}

async function getRepositories(username:string): Promise<Repository[]> {
  try {
    const response = await axios.get<Repository[]>(`https://github.com/GraysonNocera?tab=repositories`);
    return response.data;
  } catch (error) {
    // console.error(error);
    throw error;
  }
}

function onReceived(repos: Repository[]): void {

  console.log(repos)
  // let string = ''
  // repos.forEach(element => {
  //   string += element.name
  // });

  // console.log("hi")
  // fs.writeFileSync(path.join(__dirname, "data.txt"), string)
}

function onRejected(repos: Repository[]): void {
  // let string = ''
  // repos.forEach(element => {
  //   string += element.name
  // });

  // console.log("hi")
  // fs.writeFileSync(path.join(__dirname, "data.txt"), string)
  console.log(repos)
}

getRepositories('username').then(onReceived, onRejected);

