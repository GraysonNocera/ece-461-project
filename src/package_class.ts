/* Package class module
* initialized then passed to the APIs to have data loaded to it and then used by the Runner to calculate score
*/ 
export class Package{ 
    correctness:number;
    bus_factor:number;
    num_dev:number;
    pr_count:number;
    recent_commit:number;
    readme_size:number;
    comment_ratio:number; 
    ramp_up:number;
    issues:number;
    issues_active:number; 
    issue_ratio:number;
    responsiveness:number;
    license:number;
    score: number;
    url:string;
    repo:string; 
    owner:string; 
    token:string;
    last_push:string; 


    constructor(URL: string = "", repo = "", owner = "github", token = "") {
        this.correctness= 0;
        this.bus_factor= 0;
        this.num_dev= 0;
        this.pr_count= 0;
        this.recent_commit= 0;
        this.readme_size= 0;
        this.comment_ratio= 0; 
        this.ramp_up= 0;
        this.issues= 0;
        this.issues_active= 0; 
        this.issue_ratio= 0;
        this.responsiveness= 0;
        this.license= 0;
        this.score= 0;
        this.url= URL;
        this.repo= repo; 
        this.owner= owner; 
        this.token= token;
        this.last_push= ""; 
    }

}