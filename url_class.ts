export class url_class {
    correctness:number;
    bus_factror:number;
    ramp_up:number;
    responsiveness:number;
    license:number;
    score: number;
    url:string;
    repo:string; 

    constructor(URL: string = "") {
        this.url = URL;
    }

    //What do we need to call from here?  but possibly interact with whatever API's we need 
 calculate_correctness(url: url_class){

    url.correctness = 0; 
}

//API?
calculate_bus(url: url_class){
  url.bus_factror = 0; 
}
//API?
calculate_ramp(url :url_class){
  url.ramp_up = 0;
}
//API? 
claculate_responsiveness(url: url_class){
  url.responsiveness = 0; 
}
//API?
 calculate_score(url: url_class){
  //whatever we need to do to calculate formula 
}
}

