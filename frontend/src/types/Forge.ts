import { ForgeTool } from "./ForgeTool";
import { ForgeStatus, ForgeStats } from "./ForgeStatus";
import { JSONResponse } from "./JSONResponse";

//Separating into data interface/class
//https://stackoverflow.com/questions/66312939/type-inferance-using-fetch-with-typescript

export class Forge {
    id: string;
    name: string;
    url: string;
    tools: ForgeTool[];
    status = "offline";
    stats: ForgeStats | null | undefined;
    
    //This constructor is for making forges out of 'forge data'
    constructor( data : Partial<Forge>){
        this.id = data.id as string;
        this.name = data.name as string;
        this.url = data.url as string;
        this.tools = data.tools as ForgeTool[];
        this.status = data.status as string;
        this.stats = null;
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

    async checkStatus(multiforge_url: string): Promise<JSONResponse<ForgeStatus>> {
        const ret: JSONResponse<ForgeStatus> = new JSONResponse<ForgeStatus>();
        try {
            const response = await fetch(multiforge_url + "/forges/check/" + this.id + "/");
            ret.status=response.status;
            //ret.data = [];
            if (response.ok) {
                ret.data = await response.json();
                //the response data will be a json obj with status and detail
                const forgeStatus: ForgeStatus | null = ret.data;
                if (forgeStatus?.status != 400)
                {
                    console.log("FORGE WAS ONLINE: " + forgeStatus?.status);
                    this.status = 'online';
                    this.stats = forgeStatus?.details;
                }
                else
                {
                    console.log("FORGE WAS OFFLINE");
                    this.status = 'offline';
                }
                
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
