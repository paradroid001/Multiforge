import { ref } from 'vue';
import { Forge } from '../types/Forge';
import { JSONResponse } from '../types/JSONResponse';

const getForges = () => {
    //const forges = ref([]);
    //const error = ref("");

    async function loadForges(url: string): Promise<JSONResponse<Forge[]>> {
        
        const ret: JSONResponse<Forge[]> = new JSONResponse<Forge[]>();
        try {
            const response = await fetch(url);
            /*
            type JSONResponse = {
                data? : {
                    forges: Forge[]
                }
                errors?: Array<{message: string}>
            }
            */
            //forges.value = await data.json();
            //console.log(response.json());
            //const {data, errors}: JSONResponse = await response.json();
            
            //console.log(data);
            //console.log(errors);
            ret.status = response.status;
            ret.data = [];
            if (response.ok) {
                const data: Forge[] = await response.json();
                data.forEach( (fdata: Forge) => {
                    const f:Forge = new Forge(fdata);
                    console.log("Made a forge: " + f.id)
                    ret.data?.push(f);
                });
                //throw Error("No data available");
                //const forges = data?.forges
                //if (forges){
                    
                //} else {
                //    return Promise.reject(new Error("No forge data"))
                //}
            } else {

                //return Promise.reject( new Error("No data") );//errors?.map(e => e.message).join('\n') ?? 'unknown'));
                ret.errors = "No data";
            }
        }
        catch (err) {
            const e: Error = err as Error;
            ret.errors = e.message;
        }
        return Promise.resolve(ret);
    }
    return {loadForges};
};

export default getForges;