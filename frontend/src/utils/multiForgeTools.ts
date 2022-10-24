import { defineAsyncComponent } from "vue";
import { createNode } from "../utils/liteGraphUtils";
import * as litegraph from "litegraph.js";
import * as jsdom from "jsdom";

export const createMultiForgeNodes = (graph: litegraph.LGraph, 
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
      createNode("Multiforge/B642Img", {
        inputs: { string: "string" },
        outputs: { image: "image" },
        title: "Base64 2 Img",
        desc: "Parses Base64 data into Image data",
        onExecute() {
          const data: string = this.getInputData(0);
          if (data && data !== this.data) {
            ////console.log("b64 2 img got data: ");
            ////console.log(data);
            this.data = data;
            const img = new Image();
            img.src = "data:image/png;base64," + this.data;
            this.setOutputData(0, img);
          }
        },
      });
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
        },
        onExecute() {
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
      fileoutput_node.prototype.onComboChanged = function(value: number){
        //console.log("Combo changed: " + value);
        this.properties['mimeType']=value;
      };
      fileoutput_node.prototype.writeFile = function(){
        if (!this.value)
            return;
        else 
        {
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
              console.log("It was a canvas!");
            }
            else
            {
              console.log("Unknown download type");
            }
          }
          else
          {
            console.log("Standard download");
            downloadData = this.value;
            const file = new Blob(downloadData);
            url = URL.createObjectURL(file);
            element.setAttribute('href', url);
          }
          

          element.click();
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