export class MetaGraphProject {
    id: string;
    object_type: number;
    name: string;
    description: string;

    constructor( data: Partial<MetaGraphProject>){
        this.id = data.id as string;
        this.object_type = data.object_type as number;
        this.name = data.name as string;
        this.description = data.description as string;
    }

}