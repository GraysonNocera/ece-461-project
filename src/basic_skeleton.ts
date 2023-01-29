import { url_class } from './url_class';

function test(owner:string ="", repo:string =""){
    //pass in repo and owner of repo to initialize the url class
    var test = new url_class("",repo, owner);
    test.calculate_correctness(); 
}

//const var1 = process.argv[2];
//const var2 = process.argv[3];
//test(var1, var2)
test("GraysonNocera", "ece-461-project")