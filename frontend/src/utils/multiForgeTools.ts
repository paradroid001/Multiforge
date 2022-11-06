import { defineAsyncComponent } from "vue";
import { createNode } from "../utils/liteGraphUtils";
import * as litegraph from "litegraph.js";
import * as jsdom from "jsdom";
import { buffer } from "stream/consumers";
import { JSONResponse } from "../types/JSONResponse";
import { Readable } from "stream";


//const { Image, Canvas } = require('canvas');
//import * as _canvas from "canvas";
import { Canvas, CanvasRenderingContext2D, createCanvas, NodeCanvasRenderingContext2DSettings} from "canvas";
import { read } from "fs";

export const GetDataFromImage = async(element: HTMLImageElement, mime_type: string): Promise<Blob> => {
    const image = element;
    
    //For Node JS (doesn't work with drawImage?)
    //const canvas = createCanvas(100, 100);
    //For Browser
    const canvas = document.createElement('canvas');
    
    
    console.log(`${image.width}, ${image.height}`);

    // We use naturalWidth and naturalHeight to get the real image size vs the size at which the image is shown on the page
    canvas.width = 100; //image.naturalWidth;
    canvas.height = 100; //image.naturalHeight;
    //console.log(`${canvas.width}, ${canvas.height}`);
    // We get the 2d drawing context and draw the image in the top left
    const context = canvas.getContext('2d');
    if (context != null)
    {
      context.drawImage(image, 0, 0);
    }
    else
    {
      console.log("THE CONTEXT WAS NULL!");
    }
    // Convert canvas to DataURL and log to console
    //const dataURL = canvas.toDataURL('png');
      //console.log(dataURL);
      //element.setAttribute('href', dataURL);
      // Convert to Base64 string
      //const base64 = getBase64StringFromDataURL(dataURL);
      ////console.log(base64);
      //console.log(dataURL);
      //return dataURL;
    /*
    function canvasToBlob(ctx: CanvasRenderingContext2D | null, type:string) {
        return new Promise<Blob>(function (resolve, reject) {
                  ctx?.canvas.toBlob(function (blob: Blob | null) {
                                        if (blob === null)
                                          reject(blob);
                                        else
                                          resolve(blob);
                                     }, type);
               });
     }
    const blob = await canvasToBlob(canvas.getContext('2d') as CanvasRenderingContext2D, "image/png");
    */
    
    const blobdata = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    //const blob : Blob = blobdata as Blob;
    //console.log("returning blob: " + blob.type);
    
    //For NodeJS (browser canvas doesn't have this?)
    //const buffer = canvas.toBuffer('image/png');
    //blob = new Blob([buffer]);
    const dataurl = canvas.toDataURL('image/png');
    const res = await fetch(dataurl);
    const blob:Blob = await res.blob();

    return blob;
}


export function GetDataFromCanvas(element: Canvas, mime_type: string): string
{
    return "";
}

export const createMultiForgeNodes = (
  graph: litegraph.LGraph,
  assetID: string,
  userAgent: string,
  nodejsFinishCallback: (out: object) => object) => {
    //console.log(userAgent);
    
    createNode("Multiforge/ParseJSON", {
        inputs: { json: "string" },
        outputs: { obj: "object" },
        title: "ParseJSON",
        desc: "ParsesJSON from a string to an object",
        onExecute() {
          const data: string = this.getInputData(0);
          if (data && data !== this.data) {
            this.data = data;
            const obj = JSON.parse(this.data);
            this.setOutputData(obj);
          }
        },
      });
      
      const b642Img = createNode("Multiforge/B642Img", {
        inputs: { string: "string" },
        outputs: { image: "image" },
        title: "Base64 2 Img",
        desc: "Parses Base64 data into Image data",
        properties: { width: 256, height: 256, x: 0, y: 0, scale: 1.0 },
        size: [80, 80],
        onExecute() {
          const data: string = this.getInputData(0);
          if (data && data !== this.data) {
            ////console.log("b64 2 img got data: ");
            ////console.log(data);
            this.data = data;
            this.img = document.createElement('img');//new Image();
            this.img.src = "data:image/png;base64," + this.data;
            //document.body.appendChild(img);
            //this.canvas.getContext('2d')?.drawImage(this.img, 0, 0);
            console.log("Image created");
            this.img.onload = () =>{
              console.log(`DIMENSIONS: ${this.img.naturalWidth}, ${this.img.naturalHeight}`);
              this.setOutputData(0, this.img);
            };
          }
        }
      });
      
      b642Img.prototype.createCanvas = function() {
          this.canvas = document.createElement("canvas");
          this.canvas.width = this.properties["width"];
          this.canvas.height = this.properties["height"];
      };
      b642Img.prototype.onAdded = function(){
        console.log("ONADDED");
        //this.createCanvas();
        this.img = null;
      };
      b642Img.prototype.onDrawBackground = function(ctx: CanvasRenderingContext2D){
          if (ctx == null)
          {
            return;
          }
          if (this.flags.collapsed) {
            return;
          }
          if (this.img){ //this.canvas) {
              /*
              ctx.drawImage(
                  this.canvas,
                  0,
                  0,
                  this.canvas.width,
                  this.canvas.height,
                  0,
                  0,
                  this.size[0],
                  this.size[1]
              );
              */
             ctx.drawImage(this.img, 0, 0);
          }
      };
      createNode("Multiforge/TextDisplay", {
        inputs: { text: "string" },
        outputs: { text: "string" },
        title: "Text Display",
        desc: "Displays text",
        properties: { textValue: "Hello" },
        widgets: [
          {
            name: "displayText",
            type: "text",
            text: "",
            //options: { property: "textValue" },
          },
        ],
        onExecute() {
          this.setOutputData(this.getInputData(0));
          this.setProperty("textValue", this.getInputData(0));
        },
      });

      const fileoutput_node = createNode("Multiforge/Outfile", {
        inputs: { data: 0 },
        title: "OutFile",
        desc: "File Output Node",
        properties: { fileName: "outfile.json", 
                      mimeType: "text/json"},
        size: [160, 130],
        mime_type_values: ["text/json", "image/png", "image/jpeg"],

        onStart() {
          this.value = null;
          this.outData = null; //this is the data that will be sent for writing.
        },
        onExecute() {
          //console.log("In downloadfile OnExecute");
          if (this.inputs[0])
          {
              //if the value changed..
              if (this.value != this.getInputData(0))
              {
                ////console.log("Checking user agent");
                ////console.log(window.navigator.userAgent);
                //If we are running in node, trigger the download
                //console.log("I am in the execute of the download node.")
                //console.log("The user agent is " + userAgent);
                
                console.log(`The node value changed: ${this.value}, ${this.getInputData(0)}`);
                this.value = this.getInputData(0);
                const el = this.value as HTMLImageElement;
                console.log(el.naturalHeight);
                console.log(el.naturalWidth);
                console.log(el.src);
                (async() => {
                  await this.writeFile();
                  if (userAgent == 'nodejs')
                  {
                    //console.log("Its a booga, that's what it is maaaannnn");
                    //this.downloadFile();
                    nodejsFinishCallback(this.value);
                  }
                })();
                
              }
          }
        }
      });
      fileoutput_node.prototype.onComboChanged = function(value: number){
        //console.log("Combo changed: " + value);
        this.properties['mimeType']=value;
      };
      fileoutput_node.prototype.writeFile = async function() {
        if (!this.value)
        {
          return;
        }
        else {
          let outData : Blob;// = new Blob(["This is a test"]);
          
          if (this.value.nodeName === 'IMG')
          {
            console.log("FROM IMG");
            outData = await GetDataFromImage(this.value, this.properties['mimeType']) as Blob;
          }
          else{
            console.log("FROM WHATEVER");
            outData = new Blob([`Fallback data. Maybe use value? ${this.value}`], {type:"text/json"});
          }

          const response: JSONResponse<boolean> = new JSONResponse<boolean>();
          //const FormData = new FormData();
          console.log(outData.size);
          const formData = new FormData();
          //const testData = new Blob(outData, {type:"image/png"});
          
          //const blobData : BlobPart[] = [await outData.arrayBuffer()];
          //const mtype = "text/plain"; //${this.properties['mimeType']
          //console.log(outData);
          //const readstream = Readable.from(outData.stream());
          //const ab: ArrayBuffer = await outData.arrayBuffer();
          //const image: File = new File([outData], 'perlin.png', { type: 'image/png' });
          formData.append("file_data", outData, this.properties['fileName']);
          //formData.append("file_data", outData, "perlin.png");//this.properties['fileName']);
          
          
          //const boundary = '----WebKitFormBoundaryIn312MOjBWdkffIM';
          //const disposition = `Content-Disposition: form-data; name="file_data"; filename="file.png"\n`;
          //const contentType = `Content-Type: ${this.properties['mimeType']}\n\n`;
          //const contentType = `Content-Type: ${mtype}\n\n`;
          //const parts = [boundary, '\n', disposition, contentType, outData, '\n', boundary, '--\n'];
          //const bodyBlob = new Blob(parts, {type: "image:png"});
          response.options = {
            method: "POST",
            //No headers for file data
            
            headers: {
              //accept: "application/json",
              //"Content-Type": "application/json;charset=utf-8", //use mime type?
              //"Content-Type": `multipart/form-data; boundary=${boundary}`
            },
            body: formData
            
            //`${boundary}\n${disposition}\nContent-Type: ${this.properties['mimeType']}\n${outData}${boundary}`
          };
          
          await response.load("http://127.0.0.1:8000/api/graphs/" + assetID + "/asset/?mime_type=image/png");
          //  + this.properties['fileName'] + "/");
          if (response.status == 200) {
            console.log("File Out result: " + response.data);
          }
          else
          {
            console.log("Error: File out response " + response.status + response.data);
          }
        }
      };
      fileoutput_node.prototype.writefile2 = function(){
        if (!this.value)
            return;
        else 
        {
          //const element = document.createElement("a");
          //element.style.display = 'none';
          //element.setAttribute('download', this.properties.filename);
          //document.body.appendChild(element);
          //let url = "unknown";
          let outData = null;
          console.log("In writefile");
          console.log(this.value);
          console.log(this.value.nodeName);
          if (this.value.nodeName)
          {
            //console.log(this.value.nodeName);
            if (this.value.nodeName === 'IMG')
            {
              this.value = this.value as HTMLImageElement;
              console.log(`${this.value.width}, ${this.value.height}`);
              console.log(`${this.value.namespaceURI}`);
              console.log(`${this.value.naturalWidth}`);
              console.log(`${this.value['naturalWidth']}`);
              outData = GetDataFromImage(this.value, this.properties['mimeType']);
            }
            else if (this.value.nodeName === 'CANVAS')
            {
              outData = GetDataFromCanvas(this.value, this.properties['mimeType']);
            }
            else
            {
              console.log("Unknown download type");
            }
          }
          else
          {
            console.log("Standard download");
            const file = new Blob(this.value);
            //Do I create a URL? or just set outData to this.value?
            outData = URL.createObjectURL(file);
          }

          const response: JSONResponse<boolean> = new JSONResponse<boolean>();
          //const FormData = new FormData();
          response.options = {
            method: "POST",
            //No headers for file data
            
            headers: {
              //accept: "application/json",
              //"Content-Type": "application/json;charset=utf-8", //use mime type?
              "Content-Type": 'multipart/form-data; boundary=----WebKitFormBoundaryIn312MOjBWdkffIM'
            },
            body: outData as BodyInit
          };
          (async() => {
            await response.load("http://127.0.0.1:8000/api/graphs/" + assetID + "/asset/?mime_type=image/png");
            //  + this.properties['fileName'] + "/");
            if (response.status == 200) {
              console.log("File Out result: " + response.data);
            }
            else
            {
              console.log("Error: File out response " + response.status);
            }
          })();
          /* EXAMPLE OF POSTING DATA
          const saveGraphName = async (
            name: string,
            content: string,
            url: string
          ): Promise<string[] | null> => {
            const response: JSONResponse<string[]> = new JSONResponse<string[]>();
            response.options = {
              method: "POST",
              headers: {
                accept: "application/json",
                "Content-Type": "application/json;charset=utf-8",
              },
              body: JSON.stringify({ name: name, content: content }),
            };
            await response.load(url);
            if (response.status == 200) {
              return Promise.resolve(response.data);
            } else return Promise.resolve(null);
          };
          */
        }
      };

      const download_node = createNode("Multiforge/Download", {
        inputs: { data: 0 },
        title: "Download",
        desc: "Download Objects",
        properties: { fileName: "download_file.json", 
                      mimeType: "text/json"},
        size: [160, 130],
        mime_type_values: ["text/json", "image/png", "image/jpeg"],
        /*
        widgets: [
            {
                name: "downloadButton",
                type: "button",
                text: "Download"
            },
            {
                name: "mime-type",
                type: "combo",
                text: "text/json",
            }
        ],
        */
        onStart(){
            this.value = null;
            ////console.log("download node started");
            ////console.log(this.widgets);
            /*
            this.addWidget("downloadButton","button","Download", () => {
                    //console.log("Button was pressed");
                    //console.log("Data is ");
                    //console.log(this);
                });
            */
        },
        onExecute(){
            
            if (this.inputs[0])
            {
                //if the value changed..
                if (this.value != this.getInputData(0))
                {
                  this.value = this.getInputData(0);
                  ////console.log("Checking user agent");
                  ////console.log(window.navigator.userAgent);
                  //If we are running in node, trigger the download
                  //console.log("I am in the execute of the download node.")
                  //console.log("The user agent is " + userAgent);
                  if (userAgent == 'nodejs')
                  {
                    //console.log("Its a booga, that's what it is maaaannnn");
                    //this.downloadFile();
                    nodejsFinishCallback(this.value);
                  }
                }
            }
        }
      });
      download_node.prototype.onComboChanged = function(value: number){
        //console.log("Combo changed: " + value);
        this.properties['mimeType']=value;
      };

      download_node.prototype.downloadFile = function(){
        //console.log("Download file");
        //console.log(this.properties['mimeType']);
        //console.log(this.properties['fileName']);
        //console.log(navigator.userAgent);
        if (!this.value)
            return;
        else 
        {
          //console.log("Would download:");
          //console.log("Mime Type: " + this.properties.mimeType);
          //console.log(this.value);
          //console.log(typeof(this.value));

          const element = document.createElement("a");
          element.style.display = 'none';
          element.setAttribute('download', this.properties.filename);
          document.body.appendChild(element);
          let url = "unknown";

          let downloadData = null;
          if (this.value.nodeName)
          {
            //console.log(this.value.nodeName);
            if (this.value.nodeName === 'IMG')
            {
              /*
              const imgData = new Image();
              imgData.setAttribute('crossOrigin', 'anonymous');
              url = this.value.toDataURL("image/png");
              imgData.src = url;
              //element.setAttribute('href', this.value.toDataURL("image/png"));
              element.setAttribute('href', url);
              */
              const image = this.value;
              const canvas = document.createElement('canvas');

              // We use naturalWidth and naturalHeight to get the real image size vs the size at which the image is shown on the page
              canvas.width = image.naturalWidth;
              canvas.height = image.naturalHeight;
              // We get the 2d drawing context and draw the image in the top left
              canvas.getContext('2d')?.drawImage(image, 0, 0);

              // Convert canvas to DataURL and log to console
              const dataURL = canvas.toDataURL('png');
              //console.log(dataURL);
              element.setAttribute('href', dataURL);
              // Convert to Base64 string
              //const base64 = getBase64StringFromDataURL(dataURL);
              ////console.log(base64);
            }
            else if (this.value.nodeName === 'CANVAS')
            {
              //console.log("It was a canvas!");
              /*
              const blob: any = this.value.toBlob(function(blob)
              {  
  
               const imgData = new Image();
               imgData.setAttribute('crossOrigin', 'anonymous');
               url = canvas.toDataURL('png');
               imgData.src = url;
              });
              element.setAttribute('href', URL.createObjectURL(blob));
              */
            }
            else
            {
              //console.log("Unknown download type");
            }
          }
          else
          {
            //console.log("Standard download");
            downloadData = this.value;
            const file = new Blob(downloadData);
            url = URL.createObjectURL(file);
            element.setAttribute('href', url);
          }
          

          element.click();
          //document.body.removeChild(element);
          //const timeout = 1000 * 60;
          //setTimeout(function(){URL.revokeObjectURL(url); }, timeout);
        }
      };
      download_node.prototype.init = function(){
        //console.log("called init");
        const that = this;
        
        this.downloadButton = this.addWidget("button", "downloadButton", "Download", function(){that.downloadFile();});
        
        
        this.mime_types = this.addWidget("combo", "mime_types", "text/json", function(value: unknown){that.onComboChanged(value);},
                                    {
                                      values: this.mime_type_values
                                    });
        
        //console.log(this.widgets);
        //this.widgets[1].options = {values: { "title1":17, "title2":12 }}
        //this.widgets[1].callback = function(context){this.onComboChanged();};
      }
      //litegraph.LiteGraph.registerNodeType("Multiforge/Download", download_node);
      /*

          createNode("modV/visualInput", {
            title: "Visual Input",
            outputs: {
              context: "renderContext"
            },
            onExecute() {
              if (
                this.outputs[0] &&
                this.outputs[0].links &&
                !this.outputs[0].links.length
              ) {
                return;
              }

              this.setOutputData(0, {
                canvas: bufferCanvas,
                context: bufferContext,
                delta: Date.now()
              });
            }
          });

          createNode("modV/visualOutput", {
            title: "Visual Output",
            inputs: {
              context: "renderContext"
            },
            onExecute() {
              const renderContext = this.getInputData(0);
              if (!renderContext) {
                return;
              }
              outputContext.value.clearRect(0, 0, output.value.width, output.value.height);
              outputContext.value.drawImage(renderContext.canvas, 0, 0);
            }
          });

          createNode("modV/contextSplitter", {
            title: "Context Splitter",
            inputs: {
              context: "renderContext"
            },
            outputs: {
              canvas: "canvas",
              canvasContext: "canvasContext",
              delta: "number"
            },
            onExecute() {
              const renderContext = this.getInputData(0);
              if (!renderContext) return;

              const { canvas, context, delta } = renderContext;

              this.setOutputData(0, canvas);
              this.setOutputData(1, context);
              this.setOutputData(2, delta);
            }
          });

          createNode("modV/visualMonitor", {
            title: "Visual Monitor",
            inputs: {
              context: "renderContext"
            },
            size: [300, 200],
            onExecute() {
              this._renderContext = this.getInputData(0);
              this.setDirtyCanvas(true, false);
            },
            onDrawForeground(nodeContext) {
              const [width, height] = this.size;
              const { _renderContext: rCtx } = this;
              if (!rCtx) return;

              const { canvas } = rCtx;
              nodeContext.drawImage(canvas, 0, 0, width, height);
            }
          });

          createNode("modV/contextJoiner", {
            title: "Context Joiner",
            inputs: {
              canvas: "canvas",
              canvasContext: "canvasContext",
              delta: "number"
            },
            outputs: {
              context: "renderContext"
            },
            onExecute() {
              const canvas = this.getInputData(0);
              const context = this.getInputData(1);
              const delta = this.getInputData(2);

              this.setOutputData(0, { canvas, context, delta });
            }
          });

          createNode("modV/modules/circle", {
            title: "Circle",
            inputs: {
              context: "renderContext",
              circleSize: "number"
            },
            outputs: {
              context: "renderContext"
            },
            onExecute() {
              const renderContext = this.getInputData(0);
              const circleSize = this.getInputData(1) || 1;

              if (
                renderContext &&
                this.outputs[0] &&
                this.outputs[0].links &&
                this.outputs[0].links.length
              ) {
                const { canvas, context, delta } = renderContext;
                const { width, height } = canvas;
                const newSize = circleSize * (2 + Math.sin(delta / 1000) * 1.1);

                context.strokeStyle = context.fillStyle = "rgba(0,0,0,0.001)";
                context.fillRect(0, 0, width, height);
                context.strokeStyle = context.fillStyle = `hsl(${delta /
                  40}, 80%, 50%)`;
                context.beginPath();
                context.arc(width / 2, height / 2, newSize, 0, Math.PI * 2);
                // context.closePath();
                context.stroke();
              }

              this.setOutputData(0, renderContext);
            }
          });

          createNode("modV/modules/squishy", {
            title: "Squishy",
            inputs: {
              context: "renderContext"
            },
            outputs: {
              context: "renderContext"
            },
            onExecute() {
              const renderContext = this.getInputData(0);

              if (
                renderContext &&
                this.outputs[0] &&
                this.outputs[0].links &&
                this.outputs[0].links.length
              ) {
                const { canvas, context, delta } = renderContext;
                const { width, height } = canvas;
                context.drawImage(
                  canvas,
                  Math.cos(delta / 900) * 5 + Math.cos(delta / 100),
                  Math.sin(delta / 5000 + 5 * Math.sin(delta / 500)) * 10 -
                    Math.cos(delta / 500),
                  width + 20 * Math.sin(delta / 800),
                  height + 20 * Math.cos(delta / 600 + 2 * Math.sin(delta / 500))
                );
              }

              this.setOutputData(0, renderContext);
            }
          });

          createNode("modV/modules/blockColor", {
            title: "Block Colour",
            inputs: {
              context: "renderContext",
              r: "number",
              g: "number",
              b: "number",
              a: "number"
            },
            outputs: {
              context: "renderContext"
            },
            onExecute() {
              const renderContext = this.getInputData(0);
              const r = this.getInputData(1);
              const g = this.getInputData(2);
              const b = this.getInputData(3);
              const a = this.getInputData(4);

              if (
                renderContext &&
                this.outputs[0] &&
                this.outputs[0].links &&
                this.outputs[0].links.length
              ) {
                const { canvas, context, delta } = renderContext;
                const { width, height } = canvas;
                context.fillStyle = `rgba(${r * 255},${g * 255},${b * 255},${a *
                  255})`;
                context.fillRect(0, 0, width, height);
              }

              this.setOutputData(0, renderContext);
            }
          });
          */
}