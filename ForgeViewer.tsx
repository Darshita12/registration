import { faBookmark, faSave, faTimes, faWindowClose } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Group } from '@material-ui/icons';
import * as React from 'react';
import '../../../../_assets/ForgeViewer.scss'
import { timeHelper } from '../../../../_helpers';
// import {} from '../../../../.././public/'
import { ForgeViewerComment, ForgeViewerProps, ForgeViewerState } from '../../../ProjectModels';
// import {} from 'a'
export class ForgeViewer extends React.Component<ForgeViewerProps, ForgeViewerState>{

    Autodesk = window.Autodesk
    viewer: any;
    markup: any;
    viewer1: any; markupsStringData: any; viewables: any; doc: any; subToolbar: any; viewerApp: any; url = "A3-2 - WAREHOUSE WALL SECTIONS.pdf"; comment = true; markupsData: any; onToolbarCreatedBinded: any;
    sheets = [];
    options = {
        env: 'Local',
        api: 'derivativeV2', // TODO: for models uploaded to EMEA change this option to 'derivativeV2_EU'
        // getAccessToken: getForgeToken
    };
    constructor(props: ForgeViewerProps) {
        super(props);
        this.state = {
            isListView: true,
            isThumbnailView: false,
            isViewingComment: false,
            isAddingComment: false,
            sheetList: [],
            commentList: []
        }
    }
    componentDidMount() {
        let self = this;
        var acc = document.getElementsByClassName("accordion");
        var viewables;
        var i;
        var x1 = document.getElementById("button");
        if (x1) {
            x1.style.display = "none";
        }
        for (i = 0; i < acc.length; i++) {
            acc[i].addEventListener("click", function (this: any) {
                this.classList.toggle("active1");
                var panel = this.nextElementSibling;
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                }
            });
        }
        // const MODEL_URL = 'https://petrbroz.s3-us-west-1.amazonaws.com/svf-samples/sports-car/0.svf';
        const MODEL_URL = 'svfoutput/output/result.svf'
        // let documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aHcyd3k0NGR5b3hsaGFnZDVnZWJuMTM2dnlvZ3AzbjlfdHV0b3JpYWxfYnVja2V0L3JzdF9iYXNpY19zYW1wbGVfcHJvamVjdC5ydnQ="
        self.Autodesk.Viewing.Initializer(this.options, async function onInitialized() {
            // Find the element where the 3d viewer will live.    
            var htmlElement = document.getElementById('viewerDiv');
            if (htmlElement) {
                // Create and start the viewer in that element    
                self.viewer = new self.Autodesk.Viewing.GuiViewer3D(htmlElement, {
                    extensions: [],
                    disabledExtensions: { measure: true, explode: true, markupsCore: true }

                })
                self.viewer.start(MODEL_URL);
                self.viewer.loadModel(MODEL_URL, { page: 1 },
                    self.onDocumentLoadSuccess
                    // () => {}
                );

                self.viewer.loadExtension("Autodesk.Viewing.MarkupsCore").then(function () { })
                self.viewer.loadExtension("Autodesk.Viewing.MarkupsGui")
            }
        });

    }

    onClickClose = () => {
        var x1 = document.getElementById("button");
        if (x1) {
            x1.style.display = "none";
        }
        this.snapshot()
    }
    handleListOpen = () => {
        const { isListView, isThumbnailView } = this.state
        this.setState({ isListView: true, isThumbnailView: false })
    }
    handleThumbnailOpen = () => {
        const { isThumbnailView, isListView } = this.state;
        this.setState({ isThumbnailView: true, isListView: false })
    }
    onDocumentLoadFailure(viewerErrorCode: any) {
        console.error('onDocumentLoadFailure() - errorCode: ' + viewerErrorCode);
    }
    onDocumentLoadSuccess = (doc: any) => {
        // Load the default viewable geometry into the viewer.
        // Using the doc, we have access to the root BubbleNode,
        // which references the root node of a graph that wraps each object from the Manifest JSON.
        console.log('hey!!!')
        let self = this;
        this.doc = doc;
        const { sheetList } = this.state;
        // this.viewables = doc.getRoot().search(self.Autodesk.Viewing.BubbleNode.SHEET_NODE);//.getDefaultGeometry();
        // var viewables = viewable.search(Autodesk.Viewing.BubbleNode.SHEET_NODE);
        if (this.viewables) {
            console.log(this.viewables)
            this.viewables.map((name: any, i: any) => {
                this.state.sheetList.push(name.data.name);
                console.log(name.data.name)

            })
            this.setState({ sheetList });

        }
    }
    snapshot = () => {
        var screenshot = new Image();
        let self = this;
        const { commentList } = self.state;
        var x1 = document.getElementById("button");
        if (x1) {
            x1.style.display = "none";
        }
        self.setState({ isAddingComment: false })
        screenshot.onload = function () {
            self.viewer.loadExtension('Autodesk.Viewing.MarkupsCore').then(function (markupCore: any) {

                const markupExtension1 = self.viewer.getExtension("Autodesk.Viewing.MarkupsCore");
                self.markupsStringData = markupExtension1.generateData();
                markupCore.leaveEditMode();
                markupCore.loadMarkups(self.markupsStringData, "Layer_1")
                markupCore.showMarkups("Layer_1");

                // ideally should also restore the state of Viewer for this markup

                // prepare to render the markups
                let canvas = document.getElementById('snapshot');
                if (canvas) {
                    // @ts-ignore
                    canvas.width = self.viewer.container.clientWidth;
                    // @ts-ignore
                    canvas.height = self.viewer.container.clientHeight;
                    // @ts-ignore
                    var ctx = canvas.getContext('2d');
                    // @ts-ignore
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // @ts-ignore
                    ctx.drawImage(screenshot, 0, 0, canvas.width, canvas.height);
                    markupCore.renderToCanvas(ctx, function () {
                        var canvas = document.getElementById('snapshot');

                        const a = document.createElement('a');
                        document.body.appendChild(a);
                        // @ts-ignore
                        a.href = canvas.toDataURL();
                        self.state.commentList.push({ date: new Date(), sheetname: 'S201 - Upper House Framing', url: a.href, userName: "Harsh Joshi" });
                        self.setState({ commentList });
                        self.markup = a.href;
                        // a.download = 'markup.png';
                        a.click();

                        document.body.removeChild(a);
                    }, true);
                }
                // hide the markups
                markupCore.hide();

            });
        };

        // Get the full image
        self.viewer.getScreenShot(self.viewer.container.clientWidth, self.viewer.container.clientHeight, function (blobURL: any) {
            screenshot.src = blobURL;
        });
    }

    getComment = () => {
        this.setState({ isAddingComment: false, isViewingComment: true })
        // self.viewer.loadExtension('Autodesk.Viewing.MarkupsCore').then(function (markupCore: any) {

        // this.viewer.loadExtension("Autodesk.Viewing.MarkupsCore").then((ext: any) => {
        //     ext.enterEditMode();
        //     var x = document.getElementById("button");
        //     if (x) {
        //         x.style.display = "none";
        //         // } else if (x) {
        //         //     x.style.display = "none";
        //     }
        //     ext.loadMarkups(this.markupsStringData, "Layer_1")
        //     ext.showMarkups("Layer_1");
        //     (new this.Autodesk.Viewing.Extensions.Markups.Core.CreateArrow(ext, 2333, { x: 20, y: 20 }, { x: 10, y: 20 }, 'sb233')).execute();
        //     this.Autodesk.Viewing.Extensions.Markups.Core.Utils.showLmvToolsAndPanels(this.viewer)
        //     // ext.leaveEditMode();

        // })
    }
    addComment = () => {
        this.setState({ isAddingComment: true })
        this.viewer.loadExtension("Autodesk.Viewing.MarkupsCore").then((ext: any) => {
            ext.enterEditMode();
            var x = document.getElementById("button");
            if (x && x.style.display === "none") {
                x.style.display = "block";
            } else if (x) {
                x.style.display = "none";
            }

            (new this.Autodesk.Viewing.Extensions.Markups.Core.CreateArrow(ext, 2333, { x: 20, y: 20 }, { x: 10, y: 20 }, 'sb233')).execute();
            this.Autodesk.Viewing.Extensions.Markups.Core.Utils.showLmvToolsAndPanels(this.viewer)
        })
    }
    closeComment = () => {
        this.setState({ isViewingComment: false });
        this.viewer.loadExtension('Autodesk.Viewing.MarkupsCore').then(function (markupCore: any) {
            markupCore.leaveEditMode();
        })
    }
    render() {
        const { isListView, isThumbnailView, commentList } = this.state;
        return (

            <div className="app">
                <canvas hidden id="snapshot"></canvas>
                <div className="viewer-wrapper">
                    <div className="viewer-list-wrapper">
                        <div className="viewer-list-header">
                            <div><h3>Views</h3></div>
                            <div style={{ display: "inline-flex" }}>
                            </div>
                        </div>
                        <div className="viewer-left-panel-shadow"></div>
                        <div id="mobile-list-view">
                            <label>Choose a View:  </label>
                            <select name="Views" id="cars">
                                <optgroup label="Views">
                                    <option value="3D">3D</option>
                                </optgroup>
                                <optgroup label="Sheets">
                                    {this.state.sheetList.map((sheet: any) => (
                                        <option value={sheet}> sheet</option>
                                    )
                                    )}
                                    <option value="S001 - Title Sheet"> S001 - Title Sheet</option>
                                    <option value="S101 - Framin Plans">S101 - Framin Plans</option>
                                </optgroup>
                            </select>
                        </div>
                        <div className="list-container" hidden={!isListView}>
                            <ul>
                                <li>
                                    <div className="list-item list-arrow-open">
                                        <div className="list-item-info">
                                            <button className="accordion" type="button">Views</button>
                                            <div className="panel">
                                                <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="icon-3d">
                                                    <g fill="#252A3F" fill-rule="nonzero">
                                                        <path d="M12.5 5L6.005 8.75v7.5L12.5 20l6.495-3.75v-7.5L12.5 5zm0-1.155l7.495 4.328v8.654L12.5 21.155l-7.495-4.328V8.173L12.5 3.845z"></path>
                                                        <path d="M12 12v8.059h1V12z"></path>
                                                        <path d="M5.641 9.157l7.045 4.025.496-.868-7.045-4.026z"></path>
                                                        <path d="M18.863 8.288l-7.045 4.026.496.868 7.045-4.025z"></path>
                                                    </g>
                                                </svg>
                                                <span title="3D"> 3D </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="list-item">
                                        <div className="list-item-info">
                                            <button className="accordion" type="button">Sheets</button>
                                            <div className="panel">
                                                <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="icon-3d">
                                                    <g fill="#252A3F" fill-rule="nonzero">
                                                        <path d="M13 15v-3h3v-1h1v5h-5v-1h1zM16 8h1v2h-1z"></path>
                                                        <path d="M4 16v2h16V6h-3v1h-1V6H4v9h1v1H4zM20.5 5h.5v14H3V5h17.5z"></path>
                                                        <path d="M16 14h1v2h-1zM8 15v1H6v-1zM11 15v1H9v-1z"></path>
                                                        <path d="M17 15v1h-2v-1z"></path>
                                                    </g>
                                                </svg>
                                                <span title="2D"> S001 - Title Sheet </span>
                                                <br />
                                                <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="icon-3d">
                                                    <g fill="#252A3F" fill-rule="nonzero">
                                                        <path d="M13 15v-3h3v-1h1v5h-5v-1h1zM16 8h1v2h-1z"></path>
                                                        <path d="M4 16v2h16V6h-3v1h-1V6H4v9h1v1H4zM20.5 5h.5v14H3V5h17.5z"></path>
                                                        <path d="M16 14h1v2h-1zM8 15v1H6v-1zM11 15v1H9v-1z"></path>
                                                        <path d="M17 15v1h-2v-1z"></path>
                                                    </g>
                                                </svg>
                                                <span title="2D"> S101 - Framin Plans </span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        {/* <div className="list-container" hidden={!isThumbnailView}>
                            <ul>
                                <li>
                                    <div className="list-item list-arrow-open">
                                        <div className="list-item-info">
                                            <button className="accordion" type="button">Views</button>
                                            <div className="panel">
                                                <div className="thumbnail-container">
                                                    <div className="thumbnail-view" style={{ backgroundImage: `url("https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg")` }}>
                                                    </div>
                                                    <div className="thumbnail-text">3D</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="list-item list-arrow-open">
                                        <div className="list-item-info">
                                            <button className="accordion" type="button">Sheets</button>
                                            <div className="panel">
                                                <div className="thumbnail-container">
                                                    <div className="thumbnail-view" style={{ backgroundImage: `url("https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg")` }}>
                                                    </div>
                                                    <div className="thumbnail-text">S001 - Title Sheet</div>
                                                </div>
                                                <div className="thumbnail-container">
                                                    <div className="thumbnail-view" style={{ backgroundImage: `url("https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg")` }}>
                                                    </div>
                                                    <div className="thumbnail-text">S101 - Framin Plans</div>
                                                </div>
                                                <div className="thumbnail-container">
                                                    <div className="thumbnail-view" style={{ backgroundImage: `url("https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg")` }}>
                                                    </div>
                                                    <div className="thumbnail-text">S101 - Framin Plans</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div> */}
                    </div>

                </div>
                <div className="row">
                    <div className="col-sm-6" id="viewer">
                        {!this.state.isAddingComment && !this.state.isViewingComment && <button type="button" className="add-comment" onClick={this.addComment}>Add Comment</button>}
                        {this.state.isViewingComment && <button type="button" className="close-button" onClick={this.closeComment}>Close </button>}

                        <button id="button"
                            type="button" onClick={this.snapshot}>Save <FontAwesomeIcon icon={faBookmark} ></FontAwesomeIcon></button>
                        <div id="viewerDiv"></div>
                    </div>
                </div>
                <div className="viewer-comment-list">
                    <h3>Comments</h3>
                    {commentList.map((comment: ForgeViewerComment) => (
                        <div className="viewer-comment">
                            <span className="viewer-comment-user">{comment.userName}</span>
                            <span className="viewer-comment-time">{timeHelper.formattedDate(comment.date)}</span>
                            <span className="viewer-comment-thumbnail" onClick={this.getComment}>
                                <div className="viewer-comment-thumbnail-wrap" style={{ backgroundImage: `url(${comment.url})` }}>
                                </div>
                                <div className="viewer-comment-thumbnail-txt">{comment.sheetname}</div>
                            </span>
                        </div>
                    ))}
                    <div className="viewer-comment" >
                        <span className="viewer-comment-user">Harsh Joshi</span>
                        <span className="viewer-comment-time">June 05,2021</span>
                        <span className="viewer-comment-thumbnail">
                            <div className="viewer-comment-thumbnail-wrap" style={{ backgroundImage: `url(https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg)` }}>
                            </div>
                            <div className="viewer-comment-thumbnail-txt">S201 - Upper House Framing</div>
                        </span>
                    </div>

                </div>
            </div >
        )
    }
}