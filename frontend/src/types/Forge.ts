import ForgeTool from "./ForgeTool";
import JSONResponse from "./JSONResponse";

//Separating into data interface/class
//https://stackoverflow.com/questions/66312939/type-inferance-using-fetch-with-typescript

export class Forge {
    id: string;
    name: string;
    url: string;
    tools: ForgeTool[];
    status: string;
    
    //This constructor is for making forges out of 'forge data'
    constructor( data : Partial<Forge>){
        this.id = data.id as string;
        this.name = data.name as string;
        this.url = data.url as string;
        this.tools = data.tools as ForgeTool[];
        this.status = data.status as string;
    }

    async getDetails(): Promise<JSONResponse<ForgeTool[]>> {
        const ret: JSONResponse<ForgeTool[]> = new JSONResponse<ForgeTool[]>();
        try {
            const response = await fetch(this.url + "/tool/list/");
            ret.status=response.status;
            //ret.data = [];
            if (response.ok) {
                ret.data = await response.json();
                console.log("Forge got its data");
                /*
                data.forEach( (item:any) => {
                    ret.data?.push(item);
                    console.log(item);
                })
                */
                //this.status = "online";
                ret?.data?.forEach( (item: any) => {
                    console.log(item);
                    this.tools.push(item); //item conforms to forgetool interface?
                });
            } else {
                ret.errors = "No forge data";
            }
        }
        catch (err)
        {
            const e: Error = err as Error;
            ret.errors = e.message;
        }
        return ret;
    }
}

export default Forge;