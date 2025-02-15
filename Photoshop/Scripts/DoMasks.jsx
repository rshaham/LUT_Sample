

/*
@@@BUILDINFO@@@ Create Lut.jsx 1.0.0.3
*/

/*

// BEGIN__HARVEST_EXCEPTION_ZSTRING

<javascriptresource>
<name>$$$/JavaScripts/Create Lut/Menu=Cteate Lut</name>
<category>Lut</category>
<enableinfo>true</enableinfo>
<eventid>e805a6ee-6d75-4b62-b6fe-f5873b5fdf20</eventid>
<terminology><![CDATA[<< /Version 1 
                         /Events << 
                          /e805a6ee-6d75-4b62-b6fe-f5873b5fdf20 [($$$/JavaScripts/CreateLut/Menu=Create Lut) /noDirectParam <<
                          >>] 
                         >> 
                      >> ]]></terminology>
</javascriptresource>

// END__HARVEST_EXCEPTION_ZSTRING

*/

// enable double clicking from the 
// Macintosh Finder or the Windows Explorer
#target photoshop

// Make Photoshop the frontmost application
app.bringToFront();

/////////////////////////
// SETUP
/////////////////////////

// all the strings that need localized
strCreateLut = localize( "$$$/JavaScripts/CreateLut/Menu=Create Lut" );

/////////////////////////
// MAIN
/////////////////////////

var doc = app.activeDocument; // remember the document, the selected layer, the visibility setting of the selected layer
var currentHistory = doc.activeHistoryState;
var currentLayer = doc.activeLayer; // remember the selected layer
var currentVisible = currentLayer.visible;// remember the visibility setting of the selected layer
var mySelectedLayers = getSelectedLayers(); // remember the selected layers
var myDialogMode = app.displayDialogs; // remember the dialog mode
app.displayDialogs = DialogModes.NO; // set it to no to avoid dialogs

// Create only one history state for the entire script
doc.suspendHistory(strCreateLut, "main()");

// restore the selected layer
try{ 
	doc.activeLayer = currentLayer;
}catch(e) {
	; // do nothing
}

// restore the visibility setting of the original layer
try{ 
	currentLayer.visible = currentVisible;
}catch(e) {
	; // do nothing
}

if (mySelectedLayers.length != 0){//,more than one layer selected
	// restore the selected layers
	try{ 
		setSelectedLayers(mySelectedLayers);
	}catch(e) {
		; // do nothing
	}
}

// Record the script in the Actions palette when recording an action
try{ 
	var playbackDescription = new ActionDescriptor;
	var playbackReference = new ActionReference;
	playbackReference.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
	playbackDescription.putReference( charIDToTypeID("null"), playbackReference);
	app.playbackDisplayDialogs = DialogModes.NO;
	app.playbackParameters = playbackDescription;
}catch(e) {
	; // do nothing
}

app.displayDialogs = myDialogMode;

/////////////////////////
// FUNCTIONS
/////////////////////////

///////////////////////////////////////////////////////////////////////////////
// Function: main
// Usage: container function to hold all the working code that generates history states
// Input: <none> Must have an open document
// Return: <none>
///////////////////////////////////////////////////////////////////////////////
function main(){
	
	//start by applying all masks 
	//this code is reporuposed from Adobe samples
	var outFolder = Folder.selectDialog("Select folder to output file");
	var success = false;
	// Do some voodoo on the layer selection incase no layer is selected or multiple layers are selected
	try{ 
		touchUpLayerSelection()
	}catch(e) {
		; // do nothing
	}
	
	// create an array and store all the art layers in that array
	var allArtLayers = new Array;
	var allVisibleInfo = new Array;
	getAllArtLayers(doc, allArtLayers, allVisibleInfo);

	// Walk the layer stack
	for (var i = 0; i < allArtLayers.length; i++){ 
		try{ 
			doc.activeLayer = allArtLayers[i];
			if (hasVectorMask() == true){ // Only if it has a layer mask
					rasterizeLayer(); // Rasterize the layer in case it's a fill layer, smart object, video or 3D layer (since you can't apply masks to these kinds of layers)
					selectVectorMask(); // Select the vector mask
					rasterizeVectorMask(); // rasterize the vector mask
					applyLayerMask(); // Apply the layer mask
				}
			if (hasLayerMask() == true){ // Only if it has a layer mask
					rasterizeLayer(); // Rasterize the layer in case it's a fill layer, smart object, video or 3D layer (since you can't apply masks to these kinds of layers)
					selectLayerMask(); // Select the layer mask
					applyLayerMask(); // Apply the layer mask
				}
			if (hasFilterMask() == true){ // Only if it has a Smart Filter mask
					rasterizeLayer(); // Rasterize the layer - It's the only way to apply a Smart Filter Mask
				}
			allArtLayers[i].visible = allVisibleInfo[i];
		}catch(e) {
			; // do nothing
		}
	}

	//end adobe sample repurposed code
	//start our own code 

	try{ 

		data = GetDataFromDocument(doc);

		//merge all the layer groups to layers
		mergeGroups();
		
		//already stored = but save to local var
		var startDoc = doc;
		//create new document to copy our shit into
		var newDoc = app.documents.add(app.activeDocument.width, app.activeDocument.height, 72, data.fileName + ".tga", NewDocumentMode.RGB);
		
		//go back to original document
		app.activeDocument = startDoc;

		//get all the layers created in the last step
		var layer = doc.layers["Mask"];
		
		var subLayers = layer.layers;
		
		//channels names and layers name must match
		var channelsStr = ['Red', 'Green', 'Blue'];
		var channelRef = [newDoc.channels.getByName(channelsStr[0]),newDoc.channels.getByName(channelsStr[1]),newDoc.channels.getByName(channelsStr[2])];
		
		//go over each layer with the correct name and copy the data to the correct channel in the new document
		for( var i=0; i < 3; i++ ) {
			var l = subLayers[channelsStr[i]];
			
			//set our layer active
			//select all and copy
			app.activeDocument.activeLayer = l;
			app.activeDocument.selection.selectAll();
			app.activeDocument.selection.copy();
			
			//switch to new document
			//select channel
			//set it to be the only one active
			//paste
			app.activeDocument = newDoc;
			app.activeDocument.selection.load(channelRef[i], SelectionType.REPLACE);
			app.activeDocument.activeChannels = [channelRef[i]];
			app.activeDocument.paste();
		
			//restore states
			app.activeDocument.activeChannels = channelRef;
			app.activeDocument = startDoc;
		}

		//internal try - doing diffuse if it is there
		///try and copy the diffuse on top to the new file
		//will silent fail if there is no diffuse channel
		//that is the intended behavior
		try {
			app.activeDocument = startDoc;
			var l = subLayers["Diffuse"];
			app.activeDocument.activeLayer = l;
			app.activeDocument.selection.selectAll();
			app.activeDocument.selection.copy();

			app.activeDocument = newDoc;
			app.activeDocument.activeChannels = channelRef;
			app.activeDocument.paste();
			selectColorRange(
				RGBc(0.0, 0.0, 0.0),
				RGBc(0.0, 0.0, 0.0)
			);
			app.activeDocument.selection.cut();
		} catch(e) {
			//this is realy only needed for debugging
			// as it is valid to not have a diffuse 
			//alert(e);
		}
		
		//save the file we create 
		app.activeDocument = newDoc;
		var fileName = outFolder + "/" + data.fileName + ".tga";
		//alert("saving to " + fileName);
		saveTarga24(fileName);

		//close the document - forcing no dialog
		newDoc.close(SaveOptions.DONOTSAVECHANGES);
		
		success = true;
		alert("Lut created at " + fileName);

	}catch(e) {
		alert(e);
	}

	if(!success) {
		alert ("Lut creation failed");

	}

	//restore active document to the original
	app.activeDocument = doc;
	//restore history to before we messed with it
	doc.activeHistoryState = currentHistory;
	
	app.purge (PurgeTarget.HISTORYCACHES);
}

function cTID(s) { return app.charIDToTypeID(s); }
function sTID(s) { return app.stringIDToTypeID(s); }

function RGBc(r, g, b) {
    var color = new ActionDescriptor();
        color.putDouble( cTID("Rd  "), r);
        color.putDouble( cTID("Grn "), g);
        color.putDouble( cTID("Bl  "), b);   
    return color;
}

function selectColorRange(color1, color2){
    var desc = new ActionDescriptor(); 
    desc.putInteger(cTID("Fzns"), 0 ); 
    desc.putObject( cTID("Mnm "), cTID("RGBC"), color1 ); 
    desc.putObject( cTID("Mxm "), cTID("RGBC"), color2 ); 
    executeAction( cTID("ClrR"), desc, DialogModes.NO );
}

///////////////////////////////////////////////////////////////////////////////
// Function: saveTarga24
// Usage: save active document as a targa with no alpha
// Input: file name
// Return: data structure with document info 
///////////////////////////////////////////////////////////////////////////////
function saveTarga24(saveFile){

	targaSaveOptions = new TargaSaveOptions();
	targaSaveOptions.alphaChannels = true;
	targaSaveOptions.resolution = TargaBitsPerPixels.TWENTYFOUR;
	activeDocument.saveAs(File(saveFile), targaSaveOptions, true, Extension.LOWERCASE);
	
}

///////////////////////////////////////////////////////////////////////////////
// Function: mergeGroups
// Usage: iterate over layers that are under a group called MASK and merge them
// Input: none
// Return: data structure with document info 
///////////////////////////////////////////////////////////////////////////////
function mergeGroups () {
	var layer = doc.layers["Mask"];
	//alert(layer.name);
	var subLayers = layer.layers;
	var len = subLayers.length;
	for( var i=0; i<len; i++ ) {
		//alert(subLayers[i].name);
		try
		{
			doc.activeLayer = subLayers[i]; 
			merge();
		}
		catch (e) {}
	}
}

///////////////////////////////////////////////////////////////////////////////
// Function: merge
// Usage: merge selected layers
// Input: must have layers selected
// Return: data structure with document info 
///////////////////////////////////////////////////////////////////////////////
function merge(){
	var idMrgtwo = charIDToTypeID( "Mrg2" );
	var desc15 = new ActionDescriptor();
	executeAction( idMrgtwo, desc15, DialogModes.NO );
}

///////////////////////////////////////////////////////////////////////////////
// Function: GetDataFromDocument
// Usage: get document info 
// Input: document
// Return: data structure with document info 
///////////////////////////////////////////////////////////////////////////////
function GetDataFromDocument( inDocument ) {
	var data = new Object();
	if ( inDocument.fullName.cloudDocument ) {
		data.extension = "psdc";
		var fileName = inDocument.name;
		var lastDot = fileName.lastIndexOf( "." );
		var fileNameNoPath = fileName.substr( 0, lastDot );
		data.fileName = fileNameNoPath;
		data.folder = inDocument.cloudWorkAreaDirectory;
		data.fileType = "PSDC";
	} else {
		var fullPathStr = inDocument.fullName.toString();
		var lastDot = fullPathStr.lastIndexOf( "." );
		var fileNameNoPath = fullPathStr.substr( 0, lastDot );
		data.extension = fullPathStr.substr( lastDot + 1, fullPathStr.length );
		var lastSlash = fullPathStr.lastIndexOf( "/" );
		data.fileName = fileNameNoPath.substr( lastSlash + 1, fileNameNoPath.length );
		data.folder = fileNameNoPath.substr( 0, lastSlash );
		data.fileType = inDocument.fullName.type;
	}
	return data;
}

///////////////////////////////////////////////////////////////////////////////
// Function: touchUpLayerSelection
// Usage: deal with odd layer selections of no layer selected or multiple layers
// Input: <none> Must have an open document
// Return: <none>
///////////////////////////////////////////////////////////////////////////////
function touchUpLayerSelection() {
	try{ 
		// Select all Layers
		var idselectAllLayers = stringIDToTypeID( "selectAllLayers" );
			var desc252 = new ActionDescriptor();
			var idnull = charIDToTypeID( "null" );
				var ref174 = new ActionReference();
				var idLyr = charIDToTypeID( "Lyr " );
				var idOrdn = charIDToTypeID( "Ordn" );
				var idTrgt = charIDToTypeID( "Trgt" );
				ref174.putEnumerated( idLyr, idOrdn, idTrgt );
			desc252.putReference( idnull, ref174 );
		executeAction( idselectAllLayers, desc252, DialogModes.NO );
		// Select the previous layer
		var idslct = charIDToTypeID( "slct" );
			var desc209 = new ActionDescriptor();
			var idnull = charIDToTypeID( "null" );
				var ref140 = new ActionReference();
				var idLyr = charIDToTypeID( "Lyr " );
				var idOrdn = charIDToTypeID( "Ordn" );
				var idBack = charIDToTypeID( "Back" );
				ref140.putEnumerated( idLyr, idOrdn, idBack );
			desc209.putReference( idnull, ref140 );
			var idMkVs = charIDToTypeID( "MkVs" );
			desc209.putBoolean( idMkVs, false );
		executeAction( idslct, desc209, DialogModes.NO );
	}catch(e) {
		; // do nothing
	}
}

///////////////////////////////////////////////////////////////////////////////
// Function: hasLayerMask
// Usage: see if there is a raster layer mask
// Input: <none> Must have an open document
// Return: true if there is a vector mask
///////////////////////////////////////////////////////////////////////////////
function hasLayerMask() {
	var hasLayerMask = false;
	try {
		var ref = new ActionReference();
		var keyUserMaskEnabled = app.charIDToTypeID( 'UsrM' );
		ref.putProperty( app.charIDToTypeID( 'Prpr' ), keyUserMaskEnabled );
		ref.putEnumerated( app.charIDToTypeID( 'Lyr ' ), app.charIDToTypeID( 'Ordn' ), app.charIDToTypeID( 'Trgt' ) );
		var desc = executeActionGet( ref );
		if ( desc.hasKey( keyUserMaskEnabled ) ) {
			hasLayerMask = true;
		}
	}catch(e) {
		hasLayerMask = false;
	}
	return hasLayerMask;
}

///////////////////////////////////////////////////////////////////////////////
// Function: hasVectorMask
// Usage: see if there is a vector layer mask
// Input: <none> Must have an open document
// Return: true if there is a vector mask
///////////////////////////////////////////////////////////////////////////////
function hasVectorMask() {
	var hasVectorMask = false;
	try {
		var ref = new ActionReference();
		var keyVectorMaskEnabled = app.stringIDToTypeID( 'vectorMask' );
		var keyKind = app.charIDToTypeID( 'Knd ' );
		ref.putEnumerated( app.charIDToTypeID( 'Path' ), app.charIDToTypeID( 'Ordn' ), keyVectorMaskEnabled );
		var desc = executeActionGet( ref );
		if ( desc.hasKey( keyKind ) ) {
			var kindValue = desc.getEnumerationValue( keyKind );
			if (kindValue == keyVectorMaskEnabled) {
				hasVectorMask = true;
			}
		}
	}catch(e) {
		hasVectorMask = false;
	}
	return hasVectorMask;
}

///////////////////////////////////////////////////////////////////////////////
// Function: hasFilterMask
// Usage: see if there is a Smart Filter mask
// Input: <none> Must have an open document
// Return: true if there is a Smart Filter mask
///////////////////////////////////////////////////////////////////////////////
function hasFilterMask() {
	var hasFilterMask = false;
	try {
		var ref = new ActionReference();
		var keyFilterMask = app.stringIDToTypeID("hasFilterMask");
		ref.putProperty( app.charIDToTypeID( 'Prpr' ), keyFilterMask);
		ref.putEnumerated( app.charIDToTypeID( 'Lyr ' ), app.charIDToTypeID( 'Ordn' ), app.charIDToTypeID( 'Trgt' ) );
		var desc = executeActionGet( ref );
		if ( desc.hasKey( keyFilterMask ) && desc.getBoolean( keyFilterMask )) {
			hasFilterMask = true;
		}
	}catch(e) {
		hasFilterMask = false;
	}
	return hasFilterMask;
}

///////////////////////////////////////////////////////////////////////////////
// Function: selectLayerMask
// Usage: select the layer mask on the current layer
// Input: <none> Must have an open document
// Return: <none>
///////////////////////////////////////////////////////////////////////////////
function selectLayerMask() {
	try{ 
		var id759 = charIDToTypeID( "slct" );
			var desc153 = new ActionDescriptor();
			var id760 = charIDToTypeID( "null" );
				var ref92 = new ActionReference();
				var id761 = charIDToTypeID( "Chnl" );
				var id762 = charIDToTypeID( "Chnl" );
				var id763 = charIDToTypeID( "Msk " );
				ref92.putEnumerated( id761, id762, id763 );
			desc153.putReference( id760, ref92 );
			var id764 = charIDToTypeID( "MkVs" );
			desc153.putBoolean( id764, false );
		executeAction( id759, desc153, DialogModes.NO );
	}catch(e) {
		; // do nothing
	}
}

///////////////////////////////////////////////////////////////////////////////
// Function: selectVectorMask
// Usage: select the vector mask on the current layer
// Input: <none> Must have an open document
// Return: <none>
///////////////////////////////////////////////////////////////////////////////
function selectVectorMask() {
	try{ 
		var id55 = charIDToTypeID( "slct" );
		var desc15 = new ActionDescriptor();
		var id56 = charIDToTypeID( "null" );
			var ref13 = new ActionReference();
			var id57 = charIDToTypeID( "Path" );
			var id58 = charIDToTypeID( "Path" );
			var id59 = stringIDToTypeID( "vectorMask" );
			ref13.putEnumerated( id57, id58, id59 );
			var id60 = charIDToTypeID( "Lyr " );
			var id61 = charIDToTypeID( "Ordn" );
			var id62 = charIDToTypeID( "Trgt" );
        ref13.putEnumerated( id60, id61, id62 );
    desc15.putReference( id56, ref13 );
	executeAction( id55, desc15, DialogModes.NO );
	}catch(e) {
		; // do nothing
	}
}

///////////////////////////////////////////////////////////////////////////////
// Function: applyLayerMask
// Usage: apply the vector mask on the current layer
// Input: <none> Must have an open document
// Return: <none>
///////////////////////////////////////////////////////////////////////////////
function applyLayerMask() {
	try{ 
		var id765 = charIDToTypeID( "Dlt " );
			var desc154 = new ActionDescriptor();
			var id766 = charIDToTypeID( "null" );
				var ref93 = new ActionReference();
				var id767 = charIDToTypeID( "Chnl" );
				var id768 = charIDToTypeID( "Ordn" );
				var id769 = charIDToTypeID( "Trgt" );
				ref93.putEnumerated( id767, id768, id769 );
			desc154.putReference( id766, ref93 );
			var id770 = charIDToTypeID( "Aply" );
			desc154.putBoolean( id770, true );
		executeAction( id765, desc154, DialogModes.NO );
	}catch(e) {
		; // do nothing
	}
}

///////////////////////////////////////////////////////////////////////////////
// Function: rasterizeLayer
// Usage: rasterize the current layer to pixels
// Input: <none> Must have an open document
// Return: <none>
///////////////////////////////////////////////////////////////////////////////
function rasterizeLayer() {
	try{ 
		var id1242 = stringIDToTypeID( "rasterizeLayer" );
			var desc245 = new ActionDescriptor();
			var id1243 = charIDToTypeID( "null" );
				var ref184 = new ActionReference();
				var id1244 = charIDToTypeID( "Lyr " );
				var id1245 = charIDToTypeID( "Ordn" );
				var id1246 = charIDToTypeID( "Trgt" );
				ref184.putEnumerated( id1244, id1245, id1246 );
			desc245.putReference( id1243, ref184 );
		executeAction( id1242, desc245, DialogModes.NO );
	}catch(e) {
		; // do nothing
	}
}

///////////////////////////////////////////////////////////////////////////////
// Function: rasterizeVectorMask
// Usage: rasterize the vector mask on the 
// current layer to pixels
// Input: <none> Must have an open document
// Return: <none>
///////////////////////////////////////////////////////////////////////////////
function rasterizeVectorMask() {
	try{ 
		var id488 = stringIDToTypeID( "rasterizeLayer" );
		var desc44 = new ActionDescriptor();
		var id489 = charIDToTypeID( "null" );
			var ref29 = new ActionReference();
			var id490 = charIDToTypeID( "Lyr " );
			var id491 = charIDToTypeID( "Ordn" );
			var id492 = charIDToTypeID( "Trgt" );
			ref29.putEnumerated( id490, id491, id492 );
		desc44.putReference( id489, ref29 );
		var id493 = charIDToTypeID( "What" );
		var id494 = stringIDToTypeID( "rasterizeItem" );
		var id495 = stringIDToTypeID( "vectorMask" );
		desc44.putEnumerated( id493, id494, id495 );
		executeAction( id488, desc44, DialogModes.NO );
	}catch(e) {
		; // do nothing
	}
}

///////////////////////////////////////////////////////////////////////////////
// Function: getAllArtLayers
// Usage: get a reference to all artLayers in 
// the document, does recursion into groups
// Input: obj, current object, document or layerSet
// layersArray, place to put the resulting artLayers,
// layersArray is both input and output
// Return: <none>
///////////////////////////////////////////////////////////////////////////////
function getAllArtLayers(obj, layersArray, visibleArray) {
	for( var i = 0; i < obj.artLayers.length; i++) {
		layersArray.push(obj.artLayers[i]);
		visibleArray.push(obj.artLayers[i].visible);
	}
	for( var i = 0; i < obj.layerSets.length; i++) {
		getAllArtLayers(obj.layerSets[i], layersArray, visibleArray);	// recursive call
	}
}

///////////////////////////////////////////////////////////////////////////////
// Function: getSelectedLayers
// Usage: creates and array of the currently selected layers
// Input: <none> Must have an open document
// Return: Array selectedLayers
///////////////////////////////////////////////////////////////////////////////
function getSelectedLayers() {
	var selectedLayers = [];
	try {
		var backGroundCounter = activeDocument.artLayers[activeDocument.artLayers.length-1].isBackgroundLayer ? 0 : 1;
		var ref = new ActionReference();
		var keyTargetLayers = app.stringIDToTypeID( 'targetLayers' );
		ref.putProperty( app.charIDToTypeID( 'Prpr' ), keyTargetLayers );
		ref.putEnumerated( app.charIDToTypeID( 'Dcmn' ), app.charIDToTypeID( 'Ordn' ), app.charIDToTypeID( 'Trgt' ) );
		var desc = executeActionGet( ref );
		if ( desc.hasKey( keyTargetLayers ) ) {
			var layersList = desc.getList( keyTargetLayers );
			for ( var i = 0; i < layersList.count; i++) {
				var listRef = layersList.getReference( i );
				selectedLayers.push( listRef.getIndex() + backGroundCounter );
			}
			//hasLayerMask = true;
		}
	}catch(e) {
		; // do nothing
	}
	return selectedLayers;
}

///////////////////////////////////////////////////////////////////////////////
// Function: setSelectedLayers
// Usage: Selects an array of layers
// Input:  Array selectedLayers
// Return: <none>
///////////////////////////////////////////////////////////////////////////////
function setSelectedLayers( layerIndexesOrNames ) {
	// first select the first one
	setSelectedLayer( layerIndexesOrNames[0] );

	// then add to the selection
	for ( var i = 1; i < layerIndexesOrNames.length; i++) {
		addSelectedLayer( layerIndexesOrNames[i] );
	}
}

///////////////////////////////////////////////////////////////////////////////
// Function: setSelectedLayer
// Usage: Selects the first layer
// Input:  Array selectedLayers
// Return: <none>
///////////////////////////////////////////////////////////////////////////////
function setSelectedLayer( layerIndexOrName ) {
	try {
		var id239 = charIDToTypeID( "slct" );
		var desc45 = new ActionDescriptor();
		var id240 = charIDToTypeID( "null" );
		var ref43 = new ActionReference();
		var id241 = charIDToTypeID( "Lyr " );
		if ( typeof layerIndexOrName == "number" ) {
			ref43.putIndex( id241, layerIndexOrName );
		} else {
			ref43.putName( id241, layerIndexOrName );
		}
		desc45.putReference( id240, ref43 );
		var id242 = charIDToTypeID( "MkVs" );
		desc45.putBoolean( id242, false );
		executeAction( id239, desc45, DialogModes.NO );
	}catch(e) {
		; // do nothing
	}
}

///////////////////////////////////////////////////////////////////////////////
// Function: addSelectedLayer
// Usage: adds the rest of the layers in the array to the first layer
// Input:  Array selectedLayers
// Return: <none>
///////////////////////////////////////////////////////////////////////////////
function addSelectedLayer( layerIndexOrName ) {
	try {
		var id243 = charIDToTypeID( "slct" );
		var desc46 = new ActionDescriptor();
		var id244 = charIDToTypeID( "null" );
		var ref44 = new ActionReference();
		var id245 = charIDToTypeID( "Lyr " );
		if ( typeof layerIndexOrName == "number" ) {
			ref44.putIndex( id245, layerIndexOrName );
		} else {
			ref44.putName( id245, layerIndexOrName );
		}
		desc46.putReference( id244, ref44 );
		var id246 = stringIDToTypeID( "selectionModifier" );
		var id247 = stringIDToTypeID( "selectionModifierType" );
		var id248 = stringIDToTypeID( "addToSelection" );
		desc46.putEnumerated( id246, id247, id248 );
		var id249 = charIDToTypeID( "MkVs" );
		desc46.putBoolean( id249, false );
		executeAction( id243, desc46, DialogModes.NO );
	}catch(e) {
		; // do nothing
	}
}

// End Create Lut.jsx
