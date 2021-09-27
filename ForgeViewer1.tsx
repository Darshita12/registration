import { faBookmark, faSave, faTimes, faWindowClose } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Group } from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';
import { projectActions } from '../../../../_actions';
import '../../../../_assets/ForgeViewer.scss'
import { timeHelper } from '../../../../_helpers';
import { mapStateToForgeViewerProps } from '../../ProjectUtils';
import { CreateProjectDrawingComments, ForgeViewerComment, ForgeViewerProps, ForgeViewerState } from '../../../ProjectModels';
class ForgeViewer extends React.Component<ForgeViewerProps, ForgeViewerState>{

    Autodesk = window.Autodesk;
    Three = window.THREE;
    viewer: any;
    markupType: any; cam: any;
    viewer1: any; markupsStringData: any; viewables: any; doc: any;
    sheets = [];
    modeArrow: any; modeRectangle: any; modePencil: any; modeCloud: any; modeText: any; setColor: any; setStroke: any;
    options: any;
    //  = {
    //     env: 'Local',
    //     api: 'derivativeV2', // TODO: for models uploaded to EMEA change this option to 'derivativeV2_EU'
    //     getAccessToken: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJkYXRhOndyaXRlIiwiZGF0YTpyZWFkIiwiYnVja2V0OmNyZWF0ZSIsImJ1Y2tldDpkZWxldGUiXSwiY2xpZW50X2lkIjoiSHcyV3k0NGR5T1hMaEFHZDVnZUJuMTM2VnlPR3AzTjkiLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbS9hdWQvYWp3dGV4cDYwIiwianRpIjoiSFJ5bXFSRkZQN21rdzRKb1c5OHUycVlPZEtWVWg4VUFIclBVb1FGcTVMVk5VcThlYmhHaE43cHp1ck54NHFpSiIsImV4cCI6MTYyNDM2MjczMX0.MANdjueuXKqkx022UqEj_-TQSHSZBWXlxNYGEY93G6eRdsF3PwNC76O53rwb1jyV3lpV2yCFZConZU282j2LGH8z1IdxaAIfWwVaq5Yx9wVhUnqy1BPK1yC8BYIQQ68j6PI4KyjKAAF0zGaRu2ea0t9eC-mmS6PEMZaruc48L7qoEVJ-FXKcgDdR__YqDsTOmXr2gL9CVbSU8BCneagJOxp4vBu5tnM2zS3zgde7okUk58XMs3ioCW-MI8CMsohUHhGSPf_BXwQPWnphTr4wnoWihilzAohAcB9go4NAsUKkRLry9W4wvRpw951gTYP0NjgEc7pM8BeX_Dve5tm1xw'
    // };
    constructor(props: ForgeViewerProps) {
        super(props);
        this.state = {
            isListView: true,
            isThumbnailView: false,
            isViewingComment: false,
            isAddingComment: false,
            url: '',
            markerData: '',
            sheetList: [],
            camera: {}
        }
    }
    componentDidMount() {
        let self = this;
        var acc = document.getElementsByClassName("accordion");
        var viewables;
        var i;
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
        this.options = {
            env: 'Local',
            api: 'derivativeV2', // TODO: for models uploaded to EMEA change this option to 'derivativeV2_EU'
            // accessToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJkYXRhOndyaXRlIiwiZGF0YTpyZWFkIiwiYnVja2V0OmNyZWF0ZSIsImJ1Y2tldDpkZWxldGUiXSwiY2xpZW50X2lkIjoiSHcyV3k0NGR5T1hMaEFHZDVnZUJuMTM2VnlPR3AzTjkiLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbS9hdWQvYWp3dGV4cDYwIiwianRpIjoiSzdOR0tPTFVxNnlBNHRjUGxhQWFaQ3V5bzQ1R1JUZnFxa2Z2S1NVWW5MNVVXOUJkNGRWYmtLSlhsR0RsZkw0ZSIsImV4cCI6MTYyNDM3MDIwNX0.DT0B8fmMsBJUfjNZCQK1o_6e_iMvfpnl9SmezSmJ9mWlTX3ovSX0kMWBmZ925hhCebzhXlaAanoKfYsmUR9PPvTEVisGoWbIHouokx87pIEPyvQ7eNC6_XXoz5u_U3bV3oc6ZVicdr3f19xVvzxvcZgw1vmIzA9XwGba2kFf6lTsModEWMsaIcezg5wOE_2KBTKuBV1hr9_s74jSVHYRi--qNKk2yXrv2YgukAqQuVOtMGkghyAdRPAG9P5a1pFYd39NhoqFpqFZXU8L8zic-_hn2Zthzfnji7nRA_RdNuWysw-ZCMl3lgif7FtpmNgxxWjmWVvuXggAAIDEAb5Q3A'
        };
        this.props.dispatch<any>(projectActions.getProjectDrawingCommentsByProjectDrawingId(this.props.projectDrawingId));


        const MODEL_URL = 'https://petrbroz.s3-us-west-1.amazonaws.com/svf-samples/sports-car/0.svf';

        // const MODEL_URL = 'urn:adsk.viewing:fs.file:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGlwcG1hbm5fYnVja2V0L3JzdF9iYXNpY19zYW1wbGVfcHJvamVjdCUyMCgxKS5ydnQ/output/Resource/3D_View/_3D_ 1454508/_3D_.svf'
        // let documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGlwcG1hbm5fYnVja2V0L3JzdF9iYXNpY19zYW1wbGVfcHJvamVjdCUyMCgxKS5ydnQ'

        let documentId = 'urn:' + 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGlwcG1hbm5fYnVja2V0L3JzdF9iYXNpY19zYW1wbGVfcHJvamVjdCUyMCgxKS5ydnQ';

        self.Autodesk.Viewing.Initializer(this.options, async function onInitialized() {
            // Find the element where the 3d viewer will live.    

            let htmlElement = document.getElementById('viewerDiv');

            if (htmlElement) {
                // Create and start the viewer in that element   
                self.viewer = new self.Autodesk.Viewing.GuiViewer3D(htmlElement, {
                    extensions: [],
                    // disabledExtensions: { measure: true, explode: true, markupsCore: true }

                })
                self.viewer.start(MODEL_URL);
                self.viewer.loadModel(MODEL_URL, { page: 1 },
                    self.onDocumentLoadSuccess
                    // () => {}
                );
                self.cam = JSON.stringify(self.viewer.getState({ viewport: true }));
                // self.viewer.getReverseZoomDirection();
                // self.viewer.start();
                // self.Autodesk.Viewing.Document.load(documentId, self.onDocumentLoadSuccess, self.onDocumentLoadFailure);

                // self.viewer.loadExtension("Autodesk.Viewing.MarkupsCore").then(function () { })
            }
        });


    }

    onDocumentLoadFailure() {
        console.error('Failed fetching Forge manifest');
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
    onDocumentLoadSuccess = (doc: any) => {
        // Load the default viewable geometry into the viewer.
        // Using the doc, we have access to the root BubbleNode,
        // which references the root node of a graph that wraps each object from the Manifest JSON.
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
        self.setState({ isAddingComment: false })
        screenshot.onload = function () {
            self.viewer.loadExtension('Autodesk.Viewing.MarkupsCore').then(function (markupCore: any) {

                const markupExtension1 = self.viewer.getExtension("Autodesk.Viewing.MarkupsCore");
                self.markupsStringData = markupExtension1.generateData();
                self.setState({ markerData: self.markupsStringData })
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
                        self.setState({ url: a.href, camera: self.viewer.getCamera() }, () => {
                            self.getScreenAndSave();
                        });
                        // self.markup = a.href;
                        // a.download = 'markup.png';
                        a.click();

                        document.body.removeChild(a);
                    }, true);
                }
                // hide the markups
                // markupCore.hideMarkups("Layer_1");
                markupCore.hide()
            });
        };

        // Get the full image
        self.viewer.getScreenShot(self.viewer.container.clientWidth, self.viewer.container.clientHeight, function (blobURL: any) {
            screenshot.src = blobURL;
        });


    }

    getScreenAndSave() {
        this.viewer.unloadExtension('Autodesk.Viewing.MarkupsCore');
        let camView = { position: this.state.camera.position, target: this.state.camera.target }
        const obj: CreateProjectDrawingComments = {
            ProjectDrawingId: this.props.projectDrawingId,
            Photourl: { FileData: this.state.url, FileName: "a4.png", FileType: "image/png" },
            MarkerData: this.state.markerData,
            sheettitle: 'S101 - Framin Plans',
            CameraView: JSON.stringify(camView)
        }
        this.props.dispatch<any>(projectActions.createProjectDrawingComments(obj, () => {
            this.props.dispatch<any>(projectActions.getProjectDrawingCommentsByProjectDrawingId(this.props.projectDrawingId))
        }));
    }

    getComment = (markerData: string, cameraView: string) => {
        this.setState({ isViewingComment: true })
        let view = JSON.parse(cameraView)
        this.viewer.restoreState(JSON.parse(this.cam), { viewport: true }, true);
        this.viewer.autocam.setHomeViewFrom(this.viewer.navigation.getCamera());
        // await this.viewer.autocam.resetHome();
        this.viewer.navigation.setView(new this.Three.Vector3(view.position.x, view.position.y, view.position.z), new this.Three.Vector3(view.target.x, view.target.y, view.target.z))
        this.viewer.loadExtension("Autodesk.Viewing.MarkupsCore").then((ext: any) => {
            ext.enterEditMode();
            ext.leaveEditMode();
            ext.loadMarkups(markerData, "Layer_1")
            ext.showMarkups("Layer_1");

        })
    }
    addComment = () => {
        this.setState({ isAddingComment: true })
    }
    closeComment = () => {
        this.setState({ isViewingComment: false, isAddingComment: false });
        this.viewer.unloadExtension('Autodesk.Viewing.MarkupsCore');
    }
    selectArrow = () => {
        this.setState({ isAddingComment: true })
        this.viewer.loadExtension("Autodesk.Viewing.MarkupsCore").then((ext: any) => {
            ext.enterEditMode();
            ext.hideMarkups("Layer_1");
            this.markupType = "arrow";
            this.modeArrow = new this.Autodesk.Viewing.Extensions.Markups.Core.EditModeArrow(ext);
            ext.changeEditMode(this.modeArrow);
        })
    }
    selectText = () => {
        this.viewer.loadExtension("Autodesk.Viewing.MarkupsCore").then((ext: any) => {
            ext.enterEditMode();
            this.markupType = "text";
            this.modeText = new this.Autodesk.Viewing.Extensions.Markups.Core.EditModeText(ext);
            ext.changeEditMode(this.modeText);
            this.Autodesk.Viewing.Extensions.Markups.Core.Utils.showLmvToolsAndPanels(this.viewer)
        })
    }
    selectRectangle = () => {
        this.viewer.loadExtension("Autodesk.Viewing.MarkupsCore").then((ext: any) => {
            ext.enterEditMode();
            this.markupType = "rectangle";
            this.modeRectangle = new this.Autodesk.Viewing.Extensions.Markups.Core.EditModeRectangle(ext);
            ext.changeEditMode(this.modeRectangle);
            this.Autodesk.Viewing.Extensions.Markups.Core.Utils.showLmvToolsAndPanels(this.viewer)
        })
    }
    selectPencil = () => {
        this.viewer.loadExtension("Autodesk.Viewing.MarkupsCore").then((ext: any) => {
            ext.enterEditMode();
            this.markupType = "pencil";
            this.modePencil = new this.Autodesk.Viewing.Extensions.Markups.Core.EditModeFreehand(ext);
            ext.changeEditMode(this.modePencil);
            this.Autodesk.Viewing.Extensions.Markups.Core.Utils.showLmvToolsAndPanels(this.viewer)
        })
    }
    setStyle = () => {
        this.viewer.loadExtension("Autodesk.Viewing.MarkupsCore").then((ext: any) => {
            ext.enterEditMode();
            let styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity'];
            let nsu = this.Autodesk.Viewing.Extensions.Markups.Core.Utils;
            let styleObject = nsu.createStyle(styleAttributes, ext);
            styleObject['stroke-color'] = 'yellow';
            styleObject['stroke-width'] = 20;
            // Set style up
            ext.setStyle(styleObject);
            // ext.defaultContext.layer.update()
        })
    }
    selectCloud = () => {
        this.viewer.loadExtension("Autodesk.Viewing.MarkupsCore").then((ext: any) => {
            ext.enterEditMode();
            this.markupType = "cloud";
            this.modeCloud = new this.Autodesk.Viewing.Extensions.Markups.Core.EditModeCloud(ext);
            ext.changeEditMode(this.modeCloud);
        })
    }
    render() {
        const { isListView, isThumbnailView } = this.state;
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

                        {this.state.isAddingComment && <div className="add-comment-button"> <button id="button"
                            type="button" className="save-button" onClick={this.snapshot}>Save</button>
                            <button type="button" className="cancle-button" onClick={this.closeComment}>Cancle</button>
                        </div>
                        }
                        <div id="viewerDiv"></div>
                        {this.state.isAddingComment &&
                            <div className="markup-panel">
                                {/* <div className="markup-button"> */}
                                <button type="button" onClick={this.selectArrow}>Arrow</button>&nbsp;&nbsp;
                                <button type="button" onClick={this.selectText}>Text</button>&nbsp;&nbsp;
                                <button type="button" onClick={this.selectRectangle}>Rectangle</button>&nbsp;&nbsp;
                                <button type="button" onClick={this.selectPencil}>Pencil</button>&nbsp;&nbsp;
                                <button type="button" onClick={this.selectCloud}>Cloud</button>&nbsp;&nbsp;
                                {/* <button type="button" onClick={this.setStyle}>Color</button>&nbsp;&nbsp; */}
                                {/* </div> */}
                            </div>
                        }
                    </div>
                </div>
                <div className="viewer-comment-list">
                    <h3>Comments</h3>
                    {this.props.commentList.map((comment: ForgeViewerComment) => (
                        <div className="viewer-comment">
                            <span className="viewer-comment-user">{comment.username}</span>
                            <span className="viewer-comment-time">{timeHelper.formattedDate(new Date(comment.startDate))}</span>
                            <span className="viewer-comment-thumbnail" onClick={() => this.getComment(comment.markerData, comment.cameraView)}>
                                <div className="viewer-comment-thumbnail-wrap" style={{ backgroundImage: `url(${comment.photourl})` }}>
                                </div>
                                <div className="viewer-comment-thumbnail-txt">{comment.sheettitle}</div>
                            </span>
                        </div>
                    ))}
                    {/* <div className="viewer-comment" >
                        <span className="viewer-comment-user">Harsh Joshi</span>
                        <span className="viewer-comment-time">June 05,2021</span>
                        <span className="viewer-comment-thumbnail">
                            <div className="viewer-comment-thumbnail-wrap" style={{ backgroundImage: `url(${this.state.url})` }}>
                            </div>
                            <div className="viewer-comment-thumbnail-txt">S201 - Upper House Framing</div>
                        </span>
                    </div> */}

                </div>
            </div >
        )
    }
}
const connectedForgeViewer = connect(mapStateToForgeViewerProps)(ForgeViewer);
export {
    connectedForgeViewer as ForgeViewer
}