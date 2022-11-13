import { defineAsyncComponent } from "vue";
import { createNode } from "../utils/liteGraphUtils";
import * as litegraph from "litegraph.js";
import * as jsdom from "jsdom";
import { buffer } from "stream/consumers";
import { JSONResponse } from "../types/JSONResponse";
import { Canvas, CanvasRenderingContext2D} from "canvas";
import { read } from "fs";

export const GetDataFromImage = async(element: HTMLImageElement, mime_type: string): Promise<Blob> => {
    const image = element;
    image.crossOrigin = "anonymous"; //attempt to allow cross origin content, but useless after it's been loaded.
    const canvas = document.createElement('canvas');
    // We use naturalWidth and naturalHeight to get the real image size vs the size at which the image is shown on the page
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
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
    // The only method that seemed to work to get an image to a blob
    // was using dataurl and then fetching it.
    // Using canvas.toBlob worked in the browser but not node: the problem was
    // that when I went to append it into the FormData to upload I would get
    // a 'parameter 2 is not a blob' error. I put this down to something in
    // node's canvas or the canvas provided by jsdom (I don't know where
    // document.createElement('canvas') would get a canvas from in Node.)
    // Using node's canvas npm module and createCanvas method and then canvas.toBuffer and
    // creating a blob from that looked like it would work in node (but there was an 
    // error about ctx.drawImage expecting a canvas or an image...so it never actually
    // worked), but this method wouldn't work in the browser anyway so I abandoned it.
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
  backendURL: string,
  graph: litegraph.LGraph,
  assetID: string,
  userAgent: string,
  nodejsFinishCallback: (out: object) => object) => {
    console.log(userAgent);
    console.log(backendURL);

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

      const Img2b64 = createNode("Multiforge/Img2B64", {
        inputs: { image: "image"},
        outputs: {encoded: "string"},
        title: "Img 2 Base64",
        desc: "Turns image into Base64 encoded string",
        properties: { width: 256, height: 256, x: 0, y: 0, scale: 1.0 },
        size: [80, 80],
        onExecute() {
          const data: HTMLImageElement = this.getInputData[0];
          if (data && data != this.data) {
            this.data = data;
            (async() => {
              const base64Image = await FileSystem.readAsStringAsync(imageUri, {
                encoding: FileSystem.EncodingType.Base64,
              })
            })();
            
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
            console.log("From (not image or canvas)");
            outData = new Blob([`${this.value}`], {type:"text/json"});
          }

          const response: JSONResponse<boolean> = new JSONResponse<boolean>();
          const formData = new FormData();
          formData.append("file_data", outData, this.properties['fileName']);
          response.options = {
            method: "POST",
            headers: {},
            body: formData
          };
          console.log(backendURL);
          await response.load(backendURL+ "/graphs/" + assetID + "/asset/?mime_type=" + this.properties['mimeType']);
          if (response.status == 200) {
            console.log("File Out result: " + response.data);
          }
          else
          {
            console.log("Error: File out response " + response.status + response.data);
          }
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
}