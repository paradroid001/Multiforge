import { ref } from 'vue';
import { Forge } from '../types/Forge';
import { JSONResponse } from '../types/JSONResponse';

const getForges = () => {
    async function loadForges(url: string): Promise<JSONResponse<Forge[]>> {
        
        const ret: JSONResponse<Forge[]> = new JSONResponse<Forge[]>();
        try {
            const response = await fetch(url);
            ret.status = response.status;
            ret.data = [];
            if (response.ok) {
                const data: Forge[] = await response.json();
                data.forEach( (fdata: Forge) => {
                    const f:Forge = new Forge(fdata);
                    //console.log("Made a forge: " + f.id)
                    ret.data?.push(f);
                });
            
            } else {
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