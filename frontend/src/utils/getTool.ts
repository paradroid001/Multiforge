import {ForgeTool} from '../types/ForgeTool';
import JSONResponse from '@/types/JSONResponse';

const getTools = () => {
    async function loadTools (url: string): Promise<JSONResponse<ForgeTool[]>>
    {
        const ret: JSONResponse<ForgeTool[]> = new JSONResponse<ForgeTool[]>();
        try
        {
            const response = await fetch(url);
            ret.status = response.status;
            ret.data = [];
            if (response.ok)
            {
                const data: ForgeTool[] = await response.json();
                data.forEach( (ftdata: ForgeTool) =>
                {
                    //const ft: ForgeTool = (ForgeTool)ftdata;
                    console.log("Got a tool");
                    ret.data?.push(ftdata);
                });
            }
            else
            {
                ret.errors = "No data";
            }
        }
        catch (err)
        {
            const e: Error = err as Error;
            ret.errors = e.message;
        }
        return Promise.resolve(ret);
    }
    return { loadTools };
};

export default getTools;