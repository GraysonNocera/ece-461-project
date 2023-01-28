import { myFunc } from "./using_apis";

export class url_class {
    correctness:number;
    bus_factror:number;
    ramp_up:number;
    issues:number;
    responsiveness:number;
    license:number;
    score: number;
    url:string;
    repo:string; 
    owner:string; 

    constructor(URL: string = "", repo = "", owner = "github") {
        this.url = URL;
        this.correctness = 0;
        this.bus_factror = 0; 
        this.ramp_up = 0;
        this.issues = 0;
        this.responsiveness = 0;
        this.license = 0; 
        this.score = 0; 
        this.repo = repo; 
        this.owner = owner; 
    }

    //What do we need to call from here?  but possibly interact with whatever API's we need 
    //has to be async to allow use of await to fulfil promise made by myFunc
    //Will eventually be used to calculate correctess parameter but currently just used to test API interaction
 async calculate_correctness(){

    this.correctness = 0; 

    //needed to complete promise and return a number type 
    this.issues = await myFunc(this.repo, this.owner);
    console.log(this.issues);
}

//API?
calculate_bus(){
  this.bus_factror = 0; 
}
//API?
calculate_ramp(){
  this.ramp_up = 0;
}
//API? 
claculate_responsiveness(){
  this.responsiveness = 0; 
}
//API?
 calculate_score(){
  //whatever we need to do to calculate formula 
}
}

