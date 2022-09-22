//Inspired by:
//https://kentcdodds.com/blog/using-fetch-with-type-script

export class JSONResponse<T>
{
    data:T|null = null;
    status = 0;
    errors = "";
    options: RequestInit | undefined = undefined;

    async load(url:string): Promise<JSONResponse<T>> {
        try {
            console.log(`fetching ${url} with options:`);
            console.log(this.options);
            const response = await fetch(url, this.options);
            this.status = response.status;
            if (response.ok) {
                const data = await response.json();
                this.data = data as T;
            } else {
                this.errors = "No data";
            }
        }
        catch (err) {
            const e: Error = err as Error;
            this.errors = "No data";
        }
        return Promise.resolve(this);
    }
}
