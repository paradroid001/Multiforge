import { MetaGraphProject } from "../types/MetaGraph";
import { JSONResponse } from "../types/JSONResponse";

const getProjects = () => {
    async function loadProjects(url: string) : Promise<JSONResponse<MetaGraphProject[]>> {
        const ret: JSONResponse<MetaGraphProject[]> = new JSONResponse<MetaGraphProject[]>();
        try {
            const response = await(fetch(url));
            ret.status = response.status;
            ret.data = [];
            if (response.ok) {
                const data: MetaGraphProject[] = await response.json();
                data.forEach( (mgp_data: MetaGraphProject) => {
                    const project: MetaGraphProject = new MetaGraphProject(data);
                    ret.data?.push(project);
                });
            } else {
                ret.errors = "No Data";
            }
        }
        catch (err) {
            const e: Error = err as Error;
            ret.errors = e.message;
        }
        return Promise.resolve(ret);
    }
    return {loadProjects};
};

export default getProjects;