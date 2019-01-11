/* 
 * Get just the pieces for the ordering algorithms out of reform.js and put them here. 
 */

const REform = {}
REform.local = {}
REform.crud = {}
if (typeof(Storage) !== "undefined") {
  REform.localData = window.localStorage;  
} 
else {
  alert("Your browser must support local storage to use this application!");
}
REform.uniqueID = (REform.localData.getItem("uniqueID")) ? parseInt(REform.localData.getItem("uniqueID")) : 0
REform.incrementUniqueID = function(){
    REform.uniqueID++;
    REform.localData.setItem("uniqueID", ""+REform.uniqueID);
    return REform.uniqueID;
}
REform.noStructure = true  //There needs to be a structure to work with, or we are in initiate mode.
REform.noTop = true
REform.manifest = {} //keep track of the manifest being used
REform.manifestID = "" //  http://devstore.rerum.io/v1/id/5c191794e4b05b14fb531f03
REform.top = [] //All ranges from manifest.structures that are sequencing ranges
REform.root = {} //The chosen sequencing range to REform from REform.top
REform.bucket = {} //The bucket item from REform.root
REform.topChosenIndex = -1 //The index of the chosen root from REform.top
REform.error = function (msg){
    alert(msg)
}

REform.test = function(){
    
}

/**
 * Call to the REform proxy API into RERUM API to create this object in the data store
 * @param {type} obj
 * @return {JSON of the object created}
 */
REform.crud.create = async function (obj){
    let url = "create"
    let jsonReturn = {};
    await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(obj) // body data type must match "Content-Type" header
    })
    .then(REform.handleHTTPError)
    .then(resp => jsonReturn = resp.json().new_obj_state)
    .catch(error => REform.unhandled(error))
    return jsonReturn;
}

/**
 * Call to the REform proxy API into RERUM API to PUT update this object in the data store
 * Note this means the entire object will be represented under this new body.  
 * @param {type} obj
 * @return {JSON representing the new state of the object updated}
 */
REform.crud.putUpdate = async function (obj){
    let url = "update"
    let jsonReturn = {};
    await fetch(url, {
        method: "PUT", 
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(obj) // body data type must match "Content-Type" header
    })
    .then(REform.handleHTTPError)
    .then(resp => jsonReturn = resp.json().new_obj_state)
    .catch(error => REform.unhandled(error))
    return jsonReturn;
}

/**
 * Call to the REform proxy API into RERUM API to PATCH update this object in the data store
 * Note only keys that match keys in this body will be updated.  All other parts of the body
 * will be ignored.  
 * @param {type} obj
 * @return {JSON representing the new state of the object updated}
 */
REform.crud.patchUpdate = async function (obj){
    let url = "patch"
    let jsonReturn = {};
    await fetch(url, {
        method: "PATCH", 
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(obj) // body data type must match "Content-Type" header
    })
    .then(REform.handleHTTPError)
    .then(resp => jsonReturn = resp.json().new_obj_state)
    .catch(error => REform.unhandled(error))
    return jsonReturn
}

/**
 * Call to the REform proxy API into RERUM API to mark this object as deleted in RERUM.
 * @param {type} obj
 * @return {JSON representing the new state of the object updated}
 */
REform.crud.delete = async function (obj){
    let url = "delete"
    let jsonReturn = {};
    await fetch(url, {
        method: "DELETE", 
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(obj) // body data type must match "Content-Type" header
    })
    .then(REform.handleHTTPError)
    .then(resp => jsonReturn = resp.json())
    .catch(error => REform.unhandled(error))
    return jsonReturn
}

/**
 * Call to the REform proxy API into RERUM API to query for objecrts in the data store. 
 * Note all objects that have matching key:val pairs in the query will be returned,
 * including history.  
 * @param {type} obj
 * @return {JSON representing the new state of the object updated}
 */
REform.crud.query = async function (obj){
    let url = "query"
    let jsonReturn = {}
    await fetch(url, {
        method: "POST", 
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(obj) // body data type must match "Content-Type" header
    })
    .then(REform.handleHTTPError)
    .then(resp => jsonReturn = resp.json())
    .catch(error => REform.unhandled(error))
    return jsonReturn
}

/**
 * Create an object for localStorage without creating it in the database.
 * It will be created upon committing the structure
 * @param {object} obj the object being created
 * @param {object} parent the object recieving the created object (Some member of the REform.root structure)
 * @return {JSON representation of the object created in localStorage}
 */
REform.local.create = function (obj, parent){
    obj["@id"] = "/reform/create/"+REform.incrementUniqueID()
    let objType = (obj["@type"]) ? obj["@type"] : (obj.type) ? obj.type : ""
    //Will most likely need to treat different types of objects a little differently and flag unknown object types
    switch(objType){
        case "Canvas":
            if(parent){
                //Some known object in REform.root is recieving the obj.  Add the obj into the intended parent, then let REform.root know about it.  
                if("items" in parent){
                    parent.items.push(obj)
                }
                else{
                    parent.items = [obj]
                }
                REform.local.update(REform.root, parent)
            }
            else{
                //This goes straight into the bucket level
                REform.putInBucket(obj)
            }
        break
        case "Range":
            if(parent){
                //Some known object in REform.root is recieving the obj.  Add the obj into the intended parent, then let REform.root know about it.  
                if("items" in parent){
                    parent.items.push(obj)
                }
                else{
                    parent.items = [obj]
                }
                REform.local.update(REform.root, parent)
            }
            else{
             // The object is a top level range in REform.root, no need to dig
                REform.putInTopLevel(obj)
            }
        break
        default:
            //This object type is not supported and will be ignored.
        
    }
    return obj
}

/**
 * In localStorage, Update the parent object to contain the obj object 
 * @param {object} parent -
 * @param {object} obj -
 * @return {JSON representation of the object updated in localStorage}
 */
REform.local.update = function (parent, obj){
    
    /**
     * Helper function for recursion.  Check down the range.items[range.items[...], range.items[...]] tree
     * for a matching @id or id.  return false if none found.  
     * @param {object} topLevelRange - a range object with .items[] that need to all be checked and recursed
     * @param {object} searchID - the id of a REform.top.items[] tree to find
     * @return {JSON representing the matched obj from local storage that recieved the update}
     */
    function localUpdateRecursion(topLevelRange, searchID){
        let objForReturn = {}
        let parentID = (topLevelRange["@id"]) ? topLevelRange["@id"] : (topLevelRange.id) ? topLevelRange.id : "id_not_found"
        for(item in topLevelRange.items){
            let recurse = JSON.parse(JSON.stringify(topLevelRange.items[item]))
            let checkID = (recurse["@id"]) ? recurse["@id"] : (recurse.id) ? recurse.id : "id_not_found"
            if(searchID === checkID){
                obj["@id"] = checkID+"/reform/update" //queue this object for a server update
                topLevelRange.items[item] = obj
                topLevelRange["@id"] = parentID+"/reform/update" //queue this object for a server update
                objForReturn = obj
                return objForReturn
            }
            else{
                return localUpdateRecursion(recurse, searchID)
            }
        }
    }
    
    let matchedObj = {}
    let searchFor = (parent["@id"]) ? parent["@id"] : (parent.id) ? parent.id : "id_not_found"
    matchedObj = localUpdateRecursion(REform.root, searchFor)    
    //We found an object when diggin through the REform.root tree.  Now localStorage needs the REform.top change.
    if(Object.keys(matchedObj).length === 0 && matchedObj.constructor === Object){
        REform.error("Could not find the item in local storage to update...")
    }
    else{
        REform.localData.setItem("root", JSON.stringify(REform.root))
        return matchedObj
    }
}

/**
 * Remove an object from localStorage
 * @param {type} obj
 */
REform.local.delete = function (obj){
    /**
     * Helper function for recursion.  Check down the range.items[range.items[...], range.items[...]] tree
     * for a matching @id or id.  return false if none found.  
     * @param {object} topLevelRange - a range object with .items[] that need to all be checked and recursed
     * @param {object} searchID - the id of a REform.top.items[] tree to find
     * @return {JSON representing the matched obj from local storage that recieved the update}
     */
    function localDeleteRecursion(topLevelRange, searchID){
        for(item in topLevelRange.items){
            let recurse = JSON.parse(JSON.stringify(topLevelRange.items[item]))
            let checkID = (recurse["@id"]) ? recurse["@id"] : (recurse.id) ? recurse.id : "id_not_found"
            if(searchID === checkID){
                //This is the one we want to delete
                topLevelRange.items.splice(item, 1)
                objForReturn = recurse
                return objForReturn
            }
            else{
                return localDeleteRecursion(recurse, searchID)
            }         
        }
    }
    
    let matchedObj = {}
    let searchID = (obj["@id"]) ? obj["@id"] : (obj.id) ? obj.id : "id_not_found"
    matchedObj = localDeleteRecursion(REform.root, searchID)    
    //We found an object when diggin through the REform.top tree.  Now localStorage needs the REform.top change.
    if(Object.keys(matchedObj).length === 0 && matchedObj.constructor === Object){
        REform.error("Could not find the item in local storage to delete...")
    }
    else{
        REform.localData.setItem("root", JSON.stringify(REform.root))
        return matchedObj
    }
}

/**
 * Find an object by ID in localStorage
 * @param {type} obj
 * @return {JSON of the object found}
 */
REform.local.getByID = function (id){
    /**
     * Helper function for recursion.  Check down the range.items[range.items[...], range.items[...]] tree
     * for a matching @id or id.  return false if none found.  
     * @param {object} topLevelRange - a range object with .items[] that need to all be checked and recursed
     * @param {object} searchID - the id of a REform.top.items[] tree to find
     * @return {JSON representing the matched obj from local storage that recieved the update}
     */
    function localGetRecursion(topLevelRange, searchID){
        for(item in topLevelRange.items){
            let recurse = topLevelRange.items[item]
            let checkID = (recurse["@id"]) ? recurse["@id"] : (recurse.id) ? recurse.id : "id_not_found"
            if(searchID === checkID){
                //This is the item we want to return
                objForReturn = recurse
                return objForReturn
            }
            else{
                return localGetRecursion(recurse, searchID)
            }
        }
    }
    
    let matchedObj = {}
    if(id === "bucket"){
        matchedObj = REform.bucket
    }
    else{
        matchedObj = localGetRecursion(REform.root, id) 
    }
       
    if(Object.keys(matchedObj).length === 0 && matchedObj.constructor === Object){
        REform.error("Could not find the item in local storage to get...")
    }
    else{
        return matchedObj
    }
}

REform.unhandled = function(error){
    console.log("There was an unhandled error when using fetch")
    console.log(error)
    throw Error(error)
    return error
}

REform.handleHTTPerror = function(response){
    if (!response.ok){
        let status = response.status;
        switch(status){
            case 400:
                console.log("Bad Request")
            break;
            case 401:
                console.log("Request was unauthorized")
            break;
            case 403:
                console.log("Forbidden to make request")
            break;
            case 404:
                console.log("Not found")
            break;
            case 500:
                console.log("Internal server error")
            break;
            case 503:
                console.log("Server down time")
            break;
            default:
                console.log("unahndled HTTP ERROR")
        }
        throw Error("HTTP Error: "+response.statusText)
    }
    return response
}

/**
 * The action of placing Canvas objects into the bucket range of the Table of Contents.
 * The bucket range is for Canvases not yet placed into any part of the Table of Content
 * top level ranges.  
 * @param {type} obj
 * @return {JSON representing the new state of the bucket}
 */
REform.placeInBucket = function(obj){
    REform.bucket.items.push(obj);
    return REform.local.update(REform.root, REform.bucket)
}

/**
 * The action of placing new Range objects into the top level of the Table of Contents.
 * The bucket range is for Canvases not yet placed into any part of the Table of Content
 * top level ranges.  
 * @param {type} obj
 * @return {JSON representing the new state of the bucket}
 */
REform.putInTopLevel = function(obj){
    REform.top.items.push(obj)
    return REform.local.update(REform.root, obj)
}

/**
 * Users can make a "Lacuna" canvas as a holder for their structure.  They must enrich this 
 * object elsewhere.  
 * @return {JSON representing the Lacuna canvas created}
 */
REform.createLacunaCanvas = async function(){
    let canv =  
    {  
        "type":"Canvas",
        "label":{  
           "en":[  
              "Lacuna"
           ]
        }
     }
     let localCanv = REform.crud.create(canv)  
     REform.placeInBucket(localCanv)
}


/*
 * Create queued ranges to get an @id throughout the REform.top structure.
 * Then update the REform.top object in the data store. 
 * @return {undefined}
 */
REform.local.commitStrcturalChanges = function (){
    //Note that REform.bucket has been separated from REform.root.  Make sure to REform.root.items.push(bucketJSON) before updating on the server
    //This will ensure the bucket range is always last in sequencing ranges for manifests out of REform. 
    
}

REform.structureAlert = function(){
    if(REform.noStructure){
        alert("There are no ranges for this manifest.  You can begin by creating your top level range now or provide a different manifest to use.");
    }
    else{
        alert("There are ranges for this manifest, but there is no top range.  A top range must be defined to begin structuring.  You ");
    }
    
}

REform.updateManifest = function(){
    
}

REform.announceUpdatesToManifest = function(){
    
}
REform.dragOverHelp = function(e){
    
}

REform.dropHelp = function(e){
    
}


REform.askForNewTitle = function(depth){
    //Be careful here, this object may have a toggleChildren() method on it that references the id.  If you update, the id changes.  
    let area = document.querySelectorAll('[depth="'+depth+'"]')
}

REform.newGroupForm = function (depth, bool){
    
}

REform.changeLabel = function(rangeID, bool, event){
    
}


REform.showTopRangeCreation = function(){
    document.getElementById("orderedRangesContainer").style.display = "none";
    document.getElementById("makeTopRange").style.display = "block";
}

REform.createTopRange = function(){
    let topRange = {
        "viewingHint" : "top",
        "type" : "Range",
        "label": { "en": [ "Table of Contents" ] },
        "items":[],
        "behavior" : "sequence"
    }
}


/**
 * For now, let's default to the first.  Eventually, we need to offer choice
 * @param {type} topRanges
 * @return {undefined}
 */
REform.generateSequenceChoiceHTML = function (topRanges){
    let sequenceChoicesHTML = ""
    document.getElementById("sequenceChoices").innerHTML = "";
    for(let i=0; i<topRanges.length; i++){
        let choiceLabel = (topRanges[i].label && topRanges[i].label.en) ? topRanges[i].label.en[0] : "Unlabeled"
        let choiceHTML = 
            `
                <input type="button" class="sequenceChoice" onclick="REform.assignRoot(${i}, true)"
                    value="${choiceLabel}"
                />
            `
        sequenceChoicesHTML += choiceHTML
    }
    document.getElementById("sequenceChoices").innerHTML = sequenceChoicesHTML
    REform.showSequenceChoices()
    return sequenceChoicesHTML
}

/**
 * Assign the root sequencer from the top level ranges for the interface
 * @param {int} index The index of the chosen top range to use from the manifest (there may be more than one)
 * @return {undefined}
 */
REform.assignRoot = function(index, hide){
    REform.root = REform.top[index]
    REform.topChosenIndex = index
    if(hide){
        document.getElementById("mainBlockCover").style.display = "none"
        document.getElementById("sequenceChoiceNotice").style.display = "none"
        REform.drawSequence() //A new root has been assigned, let's draw the top level.
    }
}

/**
 * Assign the top level sequencing ranges to REform.top
 * @param {type} index
 * @return {undefined}
 */
REform.assignTop = function(topRanges){
    REform.top = topRanges
}


/**
 * There may be more than one top range.  Find them and assign them to REform.top
 * @param {type} manifestObj
 * @return {Array, REform.findTopRange.manifestStructures, REform.findTopRange.rangeObj}
 */
REform.findSequencingRanges = function(manifestObj){
    let manifestStructures = (manifestObj.structures) ? manifestObj.structures : []
    let topRanges = []
    let topFound = false
    if(manifestStructures.length > 0){
        REform.noStructure = false;
        for(entry in manifestStructures){
            let rangeObj = {};
            if(typeof manifestStructures[entry] === "string"){
                rangeObj = REform.resolveForJSON(manifestStructures[entry])
            }
            else if(typeof manifestStructures[entry] === "object" ){
                rangeObj = manifestStructures[entry]
            }
            if(rangeObj.viewingHint && rangeObj.viewingHint === "top" || rangeObj.behavior && rangeObj.behavior === "sequence"){
                REform.noTop = false;
                if(topFound){
                    console.log("There are multiple top ranges")
                }
                else{
                    //dont break or return, we want to be able to add in multiple
                    topFound = true
                }
                topRanges.push(rangeObj)
            }
        }
    }
    else{
        REform.noStructure = true
    }
    REform.assignTop(topRanges)
    if(topRanges.length === 1){
        //If there is the only one, then
        REform.assignRoot(0, false) // or 0, true here?
    }
    return topRanges
}

/**
 * UI to give the user a choice over which sequencing range in their manifest they want to edit.  
 * @return {undefined}
 */
REform.showSequenceChoices = function(){
    document.getElementById("mainBlockCover").style.display = "block";
    document.getElementById("sequenceChoiceNotice").style.display = "block";
}

/**
 * Check if there is more than one sequencing range in the top level of the manifest.
 * If so, make sure the user can pick one. 
 * @return {undefined}
 */
REform.offerSequenceChoice = function(){
    if(REform.top.length > 1){
        REform.generateSequenceChoiceHTML(REform.top)
        REform.showSequenceChoices()
    }
}

/**
 * Once a sequence has been chosen, draw the bucket and the top level.  
 * @return {undefined}
 */
REform.drawSequence = async function(){
    let tocRangesHTML = ""
    if(Object.keys(REform.root).length === 0 && REform.root.constructor === Object){
        //There is no root object, so we can't begin to structure anything
        //Everything goes in the bucket of unstructuresd ranges
        REform.structureAlert()
        REform.showTopRangeCreation()
    }
    else{
        //We found ranges and most importantly the TOP range, let's draw the TOC.
        document.getElementById("bucket").innerHTML = ""
        document.getElementById("toc").innerHTML = ""
        let bucketStuff = await REform.drawBucketRange(REform.findBucketRange());
        let bucketRangesHTML = "<span class='innerTitle'>UNASSIGNED</span>"+bucketStuff //Note this will take the bucket out of REform.root so we can handle it special.
        document.getElementById("bucket").innerHTML = bucketRangesHTML
        
        tocRangesHTML = await REform.drawChildRanges("1", REform.root)
        document.getElementById("toc").innerHTML = tocRangesHTML
        //Generate the bucket
        
    }
    
}

/**
 * Get the manifest object and the top level sequencing objects from the manifest URL. 
 * @param {type} manifestID
 * @return {undefined}
 */
REform.gatherTOC = async function(){
    let manifestID = REform.getURLVariable("manifest")
    let manifest = {}
    if(manifestID){
        manifest = await REform.resolveForJSON(manifestID)
    }
    else{
        REform.error("you must provide manifest={your manifest URL} in the address bar")
    }
    REform.manifest = manifest
    REform.findSequencingRanges(manifest)
    if(REform.top.length > 1){
        //We need to know which one tbe user wants us to draw
        REform.offerSequenceChoice()
    }
    else{
        //There is only one, so there is no choice, the root is assigned to the first index laredy.  Draw it.  
        REform.drawSequence()
    }
}

/**
 * 
 * @param {type} id
 * @return {unresolved}
 */
REform.resolveForJSON = async function(id){
    let j = {}
    if(id){
        await fetch(id)
            .then(REform.handleHTTPError)
            .then(resp => j = resp.json())
            .catch(error => REform.unhandled(error))
    }
    else{
        REform.error("No id provided to resolve for JSON.  Make sure you have an id.")
    }
    return j
}

/*
 * Show the children internal to the range you just clicked by expanding it into a parent range
 * or close all expansions down to the level of an already selected child you clicked. 
 * @param {type} event
 * @param {type} rangeObj
 * @return {undefined}
 */
REform.toggleChildren = function(event, rangeID){
    let childClicked = event.currentTarget //Not event.target as this could end up being one of the child elements inside the section (like its label)
    let depthToCollapseTo = childClicked.getAttribute("inDepth")

    if(childClicked.classList.contains("selectedSection")){
        REform.collapseTo(event, depthToCollapseTo)
    }
    else{
        let othersSelected = document.querySelectorAll('.selectedSection[inDepth="'+depthToCollapseTo+'"]')
        //If there is another selected section in this area, we must unselect and collapse to draw the newly selected one
        if(othersSelected.length > 0){
            REform.collapseTo(event, depthToCollapseTo)
        }
        childClicked.classList.add("selectedSection")
        REform.drawParentRange(event, rangeID)
    }
}

/**
 * By now we have our top range in REform.root
 * Use REform.root.
 * @return {undefined}
 */
REform.findBucketRange = function(){
    let bucketRange = {}
    for(range in REform.root.items){
        let innerRange = REform.root.items[range]
        let labelToCheck = (innerRange.label && innerRange.label.en) ? innerRange.label.en[0] : "label_not_found"
        if(labelToCheck === "Manifest Bucket"){
            bucketRange = innerRange
            REform.bucket = bucketRange
            REform.root.items.splice(range, 1) //Take the bucket out of the root so we can handle it special.  It will always be at the root level.
            return bucketRange
        }
    }
    REform.error("Error in manifest: could not find bucket object.  Contact the RERUM admin.")
    return bucketRange
}

REform.drawBucketRange = async function(bucketJSON){
    //The container for the bucket is already drawn on sort.html.  Just populate the bucket area with the children.
    console.log("Draw bucket range");
    console.log(bucketJSON)
    let bucketRangeItems = (bucketJSON.items) ? bucketJSON.items : [];
    let bucketChildren = bucketRangeItems.filter(o=> {
        //Only consider canvas type objects
        return (o.type && (o.type === "Canvas" || o.type==="sc:Canvas")) || (o["@type"] && (o["@type"] === "Canvas" || o["@type"]==="sc:Canvas")) 
    })
    let childRangesHTML = "";
    for(let i=0; i< bucketChildren.length; i++){
        let childObj = {}
        let range = bucketChildren[i]
        if(typeof range === "string"){
            //Need to resolve to have object and store that to localStorage
            childObj = await REform.resolveForJSON(range)
        }
        else{
            //presumably, it is an object already, so we don't need to resolve it.
            childObj = range
        }
        console.log("Bucket child "+i)
        console.log(childObj)
        let uniqueID = document.querySelectorAll('.child').length + i;
        let childLabel = (childObj.label && childObj.label.en) ? childObj.label.en[0] : "Unlabeled"
        let tag = "parent"
        let relation = ""
        let isLeaf = false
        let isOrdered = childObj.isOrdered
        let dragAttribute = `" id="drag_${uniqueID}_tmp" draggable="true" ondragstart="dragHelp(event);" ondragend="dragEnd(event);"`
        let dropAttribute = `" ondragover="dragOverHelp(event);" ondrop="dropHelp(event);"`
        let checkbox = " <input onchange='highlighLocks($(this).parent(), \"merge\");' class='putInGroup' type='checkbox' />"
        let rightClick = " oncontextmenu='breakUpConfirm(event); return false;'"
        let lockStatusUp = "false"
        let lockStatusDown = "false"
        let lockit = ""
        let childID = (childObj["@id"]) ? childObj["@id"] : (childObj.id) ? childObj.id : "id_not_found"
        if(lockStatusDown === "false"){
            lockit = `<div class='lockUp' onclick="lock("${relation}",event);"> </div>`
            //console.log("outer with lock status, not draggable");
        }
        else if(lockStatusDown === "true"){
            lockit = `<div class='lockedUp' onclick="unlock("${relation}",event);"> </div>`
        }
        let childHTML = 
        `
        <div inDepth="bucket" class="arrangeSection child sortOrder" isOrdered="${isOrdered}" lockedup="${lockStatusUp}" lockeddown="${lockStatusDown}"
        ${dropAttribute} ${dragAttribute} ${rightClick} leaf=${isLeaf} 
        onclick="REform.toggleChildren(event, '${childID}')" class="arrangeSection ${tag}" url="${childID}" parenturl="bucket">
            <span class="innerTitle">${childLabel}</span> 
            ${checkbox} 
            ${lockit}  
        </div>
        `
        console.log("Child range HTML")
        console.log(childHTML)
        childRangesHTML += childHTML;
    }
 
    return childRangesHTML;
}

/*
 * 
 * @param {type} rangeObj
 * @return {undefined}
 */
REform.drawParentRange = async function(event, rangeID){
    let rangeObj = REform.local.getByID(rangeID)
    let childClicked = event.currentTarget  //Not event.target as this could end up being one of the child elements inside the section (like its label)    
    let thisRangeDepth = document.querySelectorAll('.rangeArrangementArea').length + 1
    let rangeLabel = (rangeObj.label && rangeObj.label.en) ? rangeObj.label.en[0] : "Unlabeled"
    let childRangesHTML = await REform.drawChildRanges(thisRangeDepth, rangeObj)
    //let rangeID = (rangeObj["@id"]) ? rangeObj["@id"] : (rangeObj.id) ? rangeObj.id : "id_not_found"   
    let parentRangeHTML = 
    `
        <div class="rangeArrangementArea parent" depth="${thisRangeDepth}" url="${rangeID}">
            <div class='columnActions'>
                <input class="makeGroup" value="merge" type="button" onclick="askForNewTitle("${thisRangeDepth}")"/>
                <input class="addGroup" value="add" type="button" onclick="newGroupForm("${thisRangeDepth}", false);"/>
                <input class="makeSortable" value="sort" type="button" onclick="makeSortable("${thisRangeDepth}");"/>
                <input class="doneSortable" value="done" type="button" onclick="stopSorting("${thisRangeDepth}");"/><br>
            </div>
            <div title="${rangeLabel}" class="rAreaLabel">${rangeLabel}</div>
            <div ondragover='dragOverHelp(event);' ondrop='dropHelp(event);' class="notBucket childRangesContainer" depth="${thisRangeDepth}">${childRangesHTML}</div>
        </div>
    `
    document.getElementById("orderedRangesContainer").innerHTML += parentRangeHTML
}

/*
 * 
 * @param {type} depth
 * @param {type} rangeObj
 * @return {String}
 */
REform.drawChildRanges = async function(depth, rangeObj){
    //let rangeObj = REform.local.getByID(rangeID)
    let childRanges = (rangeObj.items) ? rangeObj.items : []
    let childRangesHTML = ""
    let parentID = (rangeObj["@id"]) ? rangeObj["@id"] : (rangeObj.id) ? rangeObj.id : "id_not_found"
    for(let i=0; i< childRanges.length; i++){
        let childObj = {}
        let range = childRanges[i]
        if(typeof range === "string"){
            //Need to resolve to have object and store that to localStorage
            childObj = await REform.resolveForJSON(range)
        }
        else{
            //presumably, it is an object already, so we don't need to resolve it.
            childObj = range
        }
        console.log("Child obj "+i);
        console.log(childObj);
        let childType = (childObj.type) ? childObj.type : (childObj["@type"]) ? childObj["@type"] : "type_not_found"
        let uniqueID = document.querySelectorAll('.child').length + i
        let childLabel = (childObj.label && childObj.label.en) ? childObj.label.en[0] : "Unlabeled"
        let tag = "parent"
        let isLeaf = (childType !== "Range") //Denote whether this is a Range object or not.  If not, it is most likely a canvas internal to a range.  
        let isOrdered = childObj.isOrdered
        let dragAttribute = `" id="drag_${uniqueID}_tmp" draggable="true" ondragstart="dragHelp(event);" ondragend="dragEnd(event);"`
        let dropAttribute = `" ondragover="dragOverHelp(event);" ondrop="dropHelp(event);"`
        let checkbox = " <input onchange='highlighLocks($(this).parent(), \"merge\");' class='putInGroup' type='checkbox' />"
        let rightClick = " oncontextmenu='breakUpConfirm(event); return false;'"
        let lockStatusUp = childObj.lockedup
        let lockStatusDown = childObj.lockeddown
        let lockit = ""
        let childID = (childObj["@id"]) ? childObj["@id"] : (childObj.id) ? childObj.id : "id_not_found"
//        if(lockStatusDown === "false"){
//            lockit = `<div class='lockUp' onclick="lock("${childID}",event);"> </div>`
//            //console.log("outer with lock status, not draggable");
//        }
//        else if(lockStatusDown === "true"){
//            lockit = `<div class='lockedUp' onclick="unlock("${childID}",event);"> </div>`
//        }
        let childHTML = 
        `
        <div inDepth="${depth}" class="arrangeSection child sortOrder" isOrdered="${isOrdered}" lockedup="${lockStatusUp}" lockeddown="${lockStatusDown}"
        ${dropAttribute} ${dragAttribute} ${rightClick} leaf=${isLeaf} 
        onclick="REform.toggleChildren(event, '${childID}')" class="arrangeSection ${tag}" url="${childID}" parenturl="${parentID}">
            <span title="${childLabel}" class="innerTitle">${childLabel}</span> 
            ${checkbox} 
            ${lockit}  
        </div>
        `
        childRangesHTML += childHTML
    }
    return childRangesHTML
}



/*
 * Close all depths down to the depth a child was toggle closed. 
 * @param {type} parentRange
 * @param {type} admin
 * @param {type} event
 * @return {Boolean}
 */
REform.collapseTo= function (event, depth){
   let deepest =  document.querySelectorAll('.rangeArrangementArea').length
   let stopAt = Number(depth)
   for(let i = deepest; i > stopAt; i--){
       //Ex child clicked was in depth 3, there are 5 depths open.  Collapse 5, collapse 4, stop at 3
       let elemToRemove = document.querySelectorAll('[depth="'+i+'"]')[0]
       elemToRemove.parentNode.removeChild(elemToRemove)
   }
   document.querySelectorAll(".selectedSection[inDepth='"+stopAt+"']")[0].classList.remove("selectedSection")
}

REform.getURLVariable = function (variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable){return pair[1];}
    }
    return(false);
}

REform.updateURL = function (variable, value){
    var toAddressBar = document.location.href;
    //If nothing is passed in, just ensure the projectID is there.
    //console.log("does URL contain projectID?        "+REform.getURLVariable("projectID"));
    if(REform.getURLVariable(variable)){
        toAddressBar = "?projectID="+tpen.project.id;
    }
    //Any other variable will need to be replaced with its new value
    if(piece === "p"){
        if(!REform.getURLVariable("p")){
            toAddressBar += "&p=" + tpen.project.folios[tpen.screen.currentFolio].folioNumber;
        }
        else{
            toAddressBar = replaceURLVariable("p", tpen.project.folios[tpen.screen.currentFolio].folioNumber);
        }
        var relocator = "buttons.jsp?p="+tpen.project.folios[tpen.screen.currentFolio].folioNumber+"&projectID="+tpen.project.id;
        $(".editButtons").attr("href", relocator);
    }
    else if (piece === "attempts"){
        if(!REform.getURLVariable("attempts")){
            toAddressBar += "&attempts=1";
        }
        else{
            var currentAttempt = REform.getURLVariable("attempts");
            currentAttempt = parseInt(currentAttempt) + 1;
            toAddressBar = replaceURLVariable("attempts", currentAttempt);
        }
    }
    window.history.pushState("", "T&#8209;PEN 2.8 Transcription", toAddressBar);
}

REform.replaceURLVariable = function (variable, value){
       var query = window.location.search.substring(1)
       var location = window.location.origin + window.location.pathname
       var vars = query.split("&");
       var variables = ""
       for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=")
        if(pair[0] == variable){
            var newVar = pair[0]+"="+value;
            vars[i] = newVar;
            break;
        }
       }
       variables = vars.toString()
       variables = variables.replace(/,/g, "&")
       return(location + "?"+variables)
}



/* TODO */

/** 
* It could be a group locked together that we are sorting, so we need to account for making a clone helper for the group
* of elements and making the move actually move all the elements together. 
*/
REform.makeSortable = function (columnDepth){
    var column = column.attr("depth"); //set this properly!!
    $.each($(".adminTrail").find(".rangeArrangementArea").not(".rangeArrangementArea[depth='"+columnDepth+"']"), function(){
        var overDiv = $("<div class='areaCover'></div>");
        $(this).append(overDiv);
    });

    column.find(".makeSortable").hide();
    column.find(".doneSortable").show();
    column.children('.notBucket').sortable({
        helper:function(e, item){
            if(!item.hasClass('selectedSection'))item.addClass('selectedSection');
            var chainedElems = chainTargets(item[0]);
            var helper = $('<div class="sortHelper"></div>');
            var hlpWidth = 0;
            // grab all the chained elements and add the selected class
            // clone selected items before hiding
            for(var i=0; i<chainedElems.length; i++){
                var element = $(chainedElems[i]);
                if(i===0){
                    hlpWidth = element.parent().width() + 50;
                }
                var clonedElement = element.clone();
                clonedElement.addClass("helper");
                clonedElement.find(".lockedUp").remove();
                clonedElement.find(".lockUp").remove();
                clonedElement.find(".putInGroup").remove();
                helper.append(clonedElement);
                element.addClass("selectedSection");
                element.addClass("hidden");
            }
            helper.css("width", hlpWidth);
            return helper;
        },
        start: function (e, ui) {
            var elements =$(".selectedSection.hidden").not(".helper");
            //store the selected items to item being dragged
            ui.item.data('items', elements);
        },
        stop: function (e, ui) {
            //This will always take the selected item and place it in the drop spot.  It will then bring the other items,
            //and you have to tell the other items whether they go after or before the item that was just sorted.  
            var itemAfter = $(ui.item).next();
            var itemBefore = $(ui.item).prev();
            //item being sorted cannot be placed inbetween locked items.
            if(itemAfter.attr("lockedup") === "true" && itemBefore.attr("lockeddown") === "true"){
                alert("You cannot put this object in the middle of locked items");
                $('.hidden').removeClass("hidden");
                $(".selectedSection").removeClass("selectedSection");
                return false;
            }
            var clonedSet = $(ui.item.data('items').clone());
            clonedSet.removeClass("hidden selectedSection");
            // you must clone the set or the original ui.item will not be present after replaceWith()
            $(ui.item).replaceWith(clonedSet);
            $('.hidden').remove();
            $(".selectedSection").removeClass("selectedSection");
            //unselect since the operation is complete

        },
        placeholder: "customPlaceholder",
        forcePlaceholderSize: true,
        axis:"y",
        cursorAt: { top: 0, left: 0 }
    });
}

REform.stopSorting = function stopSorting(depth){
    var windowurl = document.location.href;
    var children = column.children(".notBucket").children(".arrangeSection");
    var childrenArray = [];
    if(windowurl.indexOf("demo=1") >-1){
        column.children(".notBucket").sortable("destroy");
        $(".areaCover").remove();
        column.find(".makeSortable").show();
        column.find(".doneSortable").hide();
    }
    else{
        $.each(children, function(){
            childrenArray.push($(this).attr("rangeID"));
        });
    //need to update this column range id with the new order of ranges
        var updateURL ="http://brokenbooks.org/brokenBooks/updateRange"; //update list with the range removed
        var paramObj1 = {"@id" : column.attr("rangeID"), "ranges" : childrenArray};
        var params1 = {"content" : JSON.stringify(paramObj1)};
        $.post(updateURL, params1, function(){
           column.children(".notBucket").sortable("destroy");
           $(".areaCover").remove();
           column.find(".makeSortable").show();
           column.find(".doneSortable").hide();
           populateMessage("new order saved!");
        });
    }

}

function chainLockedRanges(currentObj){
    var text = "";
    text = currentObj.attr("id");
    var nextObj = currentObj.next();
    var prevObj = currentObj.prev();
    while(nextObj.attr("lockedup") === "true"){
        text += (","+nextObj.attr('id'));
        nextObj = nextObj.next();
    }
    while(prevObj.attr("lockeddown") === "true"){
        text = prevObj.attr("id")+","+text;
        prevObj = prevObj.prev();
    }
    return text;
}

function chainTargets(currentTarget){
    var targetArray = [currentTarget];
    var nextObj = currentTarget.nextElementSibling;
    var prevObj = currentTarget.previousElementSibling;
    while(nextObj && nextObj.getAttribute("lockedup") === "true"){
        targetArray.push(nextObj);
        nextObj = nextObj.nextElementSibling;
    }
    while(prevObj && prevObj.getAttribute("lockeddown") === "true"){
        targetArray.unshift(prevObj);
        prevObj = prevObj.previousElementSibling;
    }
    return targetArray;
}

function dragHelp(event){
    //http://www.kryogenix.org/code/browser/custom-drag-image.html
    var currentObj = $(event.target);
    var textArray = chainLockedRanges(currentObj);
    var targets = chainTargets(event.target);
    var crt = document.createElement("div");
    crt.setAttribute("id", "dragClone");
    for(var i = 0; i < targets.length; i++) {
        var targetClone = targets[i].cloneNode(true);
        crt.appendChild(targetClone); // Note that this does NOT go to the DOM
    }
    crt.style.position = "absolute"; 
    crt.style.top = "0px"; 
    crt.style.right = "200px";
    crt.style["z-index"] = "0";
    document.body.appendChild(crt);
    console.log(crt);
    event.dataTransfer.setData("text", textArray);
    event.dataTransfer.setDragImage(crt, 0, 0);
    
}


function dragEnd(event){
    $( event.dragProxy ).remove();
//    $(".dragThis").animate({
//            top: event.offsetY,
//            left: event.offsetX,
//            opacity: 1
//    })
    $(".dragCover").remove();
    $(".dragHelper").remove();
    $("#dragClone").remove();
}

/*
 * 
 * @param {type} event
 * @return {Boolean}
 * When a user 
 */
function dropHelp(event){
    //console.log("Drop help");
    var windowURL = document.location.href;
    var targetTag = event.target.tagName;
    var targetClass = event.target.className;
    var target = undefined;
    var dropIntoBucket = false;
    if(targetTag == "SPAN" || targetTag.indexOf("INPUT")>-1){
        var eventParent = "";
        if(targetClass.indexOf("countInt")>-1){
            eventParent = event.target.parentNode.parentNode;
        }
        else{
            eventParent = event.target.parentNode;
        }
        target = eventParent;
    }
    else{
        target = event.target;
    }
  
    var outer = $(target).closest(".arrangeTrail");
    //console.log("Drop target");
    //console.log(target);
    event.preventDefault();
    var relation = target.getAttribute('rangeid');
    var targetClass = target.className;
    var areaDroppedTo = $(target).parents(".rangeArrangementArea").attr("rangeID");
    var areaDroppedToDepth = parseInt($(target).parents(".rangeArrangementArea").attr("depth"));
    //TODO do this in a loop for all the ids and grab all the children in a locked situation.  
    var data = "";
    data = event.dataTransfer.getData("text");
    var data_array = data.split(",");
    var childArray = [];
    var childIDArray = [];
    var leafIncluded = false;
    var selfTarget = false;
    var targetCount = 0;
    for(var l=0;l<data_array.length;l++){
        var data_range = data_array[l];
        var child = document.getElementById(data_range);
        if(child.getAttribute("leaf") === "true"){
            leafIncluded = true;
            targetCount += 1;
        }
        else{
            targetCount += parseInt($(child).find(".folioCount").children(".countInt").html()); 
        }
        if(target.id+"_tmp" == data_range || target.id == data_range){
            selfTarget = true;
        }
        if(child === null || child === undefined) {
            
        } //prolly dont do this in the loop.
        else{
            childArray.push(child);
            childIDArray.push(child.getAttribute("rangeid"));
            
        }
        if(l == data_array.length -1 ){
           childArray = $(childArray);
        }
    }
    var areaTakenFrom = outer.find($("#"+data_array[0])).parents(".rangeArrangementArea").attr("rangeID");
    var areaTakenFromDepth = parseInt(outer.find($("#"+data_array[0])).parents(".rangeArrangementArea").attr("depth"));
    
    //TODO end loop
    if(target.getAttribute("leaf") === "true"){
        alert("You cannot drop into a leaf");
        return false;
    }
    if(target.parentNode.className.indexOf("ordered") > -1){
        //cannot drop into locked leaves
        //console.log("cannot drop into locked leaves");
        alert("You cannot drop into a set of locked leaves");
        return false;
    }
    if(targetClass.indexOf("selectedSection") > -1){ //|| droppedClass.indexOf("selectedSection") > -1
        //cannot drop into a selected section, cannot drop a selected section
        alert("You cannot drag and drop or drop into opened sections.");
        return false;
    } 
    if(targetClass.indexOf("ordered")>-1){
        //cannot drop into locked leaves parent range
        alert("You cannot drop into a set of locked leaves");
        return false;
    }
    if(targetClass.indexOf('notBucket') > -1){
      if($(target).closest(".rangeArrangementArea").attr("depth") === "1" && leafIncluded){
          //cannot drop leaves into the top level structure. 
          alert("You cannot drop leaves into the top level");
          return false;
      }
      $.each(childArray, function(){
          $(this).css("display", "block"); ;
      });
    }
    else{
      $.each(childArray, function(){
          $(this).attr("id", $(this).attr("id"+"_tmp"));
          $(this).css("display", "none");
      });
      if(targetClass.indexOf('unassigned') > -1){
          areaDroppedTo = "unassigned";
      }
    }
    var append = true;
//    if(target.id === data || target.id === data+"_tmp"){
//        $.each(childArray, function(){
//          $(this).attr("id", $(this).attr("id").replace("_tmp", ""));
//          $(this).css("display", "block");
//        });
//        append = false;
//    }   
    if(areaDroppedTo === areaTakenFrom){//dont append to self or same section
      if(target.className.indexOf("notBucket") > -1){
        append = false;
      }
    }
    else{
        if(selfTarget) { //prevent dropping into same column or on self
          append = false;
          $.each(childArray, function(){
            $(this).attr("id", $(this).attr("id").replace("_tmp", ""));
            $(this).css("display", "block");
          });
        }    
    }
//    console.log("Append?");
//    console.log(append);
    if(append){
        $.each(childArray, function(){
          $(this).attr("relation", relation);
          $(this).attr("class", $(this).attr("class").replace(/\bparent\b/,''));
          if(!$(this).hasClass("child")){
              $(this).addClass("child");
          }
        });
        $(target).append(childArray);
        //make the target flash
        dropFlash($(target));
        var targetID= "";
        if(target.className.indexOf("notBucket") > -1){
              targetID = target.parentNode.getAttribute("rangeid");
          }
          else{
              targetID = target.getAttribute("rangeid");
          }
        updateRange(targetID, childIDArray, ""); //do not put the append flag, the following code handles that.
      
      if(windowURL.indexOf("demo=1") === -1){
//          console.log("move "+child.getAttribute("rangeid"));
//          console.log("from "+areaTakenFrom);
//          console.log("to "+target.getAttribute("rangeid"));
          var toTarget = "";
          if(target.className.indexOf("notBucket") > -1){
//              console.log("class name is notBucket.  Get parent");
//              console.log(target.parentNode.getAttribute("rangeid"));
              toTarget = target.parentNode.getAttribute("rangeid");
          }
          else{
//              console.log("dropped in an actual section.");
//              console.log(target.getAttribute("rangeid"));
              toTarget = target.getAttribute("rangeid");
              if(target.className.indexOf("bucket")>-1){
                  dropIntoBucket = true;
                  console.log("Drop into bucket");
              }
          }
          moveAndUpdate(childIDArray, areaTakenFrom, toTarget, dropIntoBucket);
      }
      else{
          populateMessage("Object moved!");
          //$("#"+data).remove();
      }      
    //There has been a change, reset the folio counts.  FIXME: Does not decrement with the area where the leaf was taken from, need to make this smarter.
     //There has been a change, reset the folio counts.  FIXME: Does not decrement with the area where the leaf was taken from, need to make this smarter.
         $.each($(".arrangeSection").not(".selectedSection"), function(){
            var folioCount = $(this).find("div[leaf='true']").length;
            var folioCountHtml = $(this).find(".folioCount");
            var leafURL = $(this).attr("rangeID");
            if($(this).attr("leaf") !== "true" ){ //&& $(this).attr("isOrdered") !== "true"
                folioCountHtml.find(".countInt").html(folioCount);
            }
            else if($(this).attr("leaf") === "true"){
                var leafIsInURL = $(this).parents(".rangeArrangementArea").attr("rangeID");
                var new_folioCountHtml = $("<span onclick=\"existing('"+leafURL+"','"+leafIsInURL+"')\" class='folioCount'><img class='leafIcon' src='http://brokenbooks.org/brokenBooks/images/leaf.png'/></span>");
                folioCountHtml.replaceWith(new_folioCountHtml);
            }

       });
       
        if(areaDroppedToDepth < areaTakenFromDepth){
            $.each($(".selectedSection"), function(){
                if(parseInt($(this).parents("div[depth]").attr("depth")) >= areaDroppedToDepth 
                && parseInt($(this).parents("div[depth]").attr("depth")) < areaTakenFromDepth
                && $(this).attr("leaf")!=="true"){//&& $(this).attr("isOrdered") !== "true"
                    var folioCount = $(this).children(".folioCount").children(".countInt").html();
                    folioCount = parseInt(folioCount) - targetCount;
                    var folioCountHTML = $(this).children(".folioCount");
                    folioCountHTML.children(".countInt").html(folioCount);
                }
            });
        }
       //console.log("area taken from depth: "+areaTakenFromDepth);
       if(outer.find($("div[depth='"+areaTakenFromDepth+"']")).children(".notBucket").children(".arrangeSection").length === 0){
        outer.find($("div[depth='"+areaTakenFromDepth+"']")).children(".makeSortable").hide();
        outer.find($("div[depth='"+areaTakenFromDepth+"']")).children(".doneSortable").hide();
         //newArea.children(".addGroup").hide();
      }
      else{
        outer.find($("div[depth='"+areaTakenFromDepth+"']")).children(".makeSortable").show();
        //$("div[depth='"+areaTakenFromDepth+"']").children(".doneSortable").show();
         //newArea.children(".addGroup").show();
      }
    }
    else{

    }
    event.stopPropagation();
    //do not call dropEvent on other children being dropped.
}

function dropFlash($elem){
    if($elem.attr("class").indexOf("notBucket") === -1){
        $elem.addClass("dropColor");
    }
    $elem.effect("bounce", {}, 400);
    setTimeout(function(){
        $elem.removeClass("dropColor");
    }, 400);
}

function dragOverHelp(event){
    event.preventDefault();
}

/* 
 * The goal here is to have a 'Publish' function, from which the sequence of the structure will produce
 * a hard-ordered sequence of the manifest.sequence[0].  

 * manifestCanvases: This is the global variable holding manifest.structures[0].  It should be unaltered based 
 * on actions of this page.
 * 
 * rangeCollection: This is the global variable holding manifest.structures.  It has been altered based on
 * actions of this page, but has been kept up to date so updating off of it should be safe.
 */
function orderSeqFromStruct(){
    var parent
    var canvases = []

    function pushToOrderedSequence(canvas_uri, ordered_canvases){
        $.each(manifestCanvases,function(){
            if(this["@id"] === canvas_uri){
                delete this["_id"];
                canvases.push(this);
                return false;
            }
        });
    }

    function getParentest(rangeList){
        var parentest = {'@id': "root", label: "Table of Contents", within:"root" };
        for(var i=0; i<rangeList.length; i++){
            if(rangeList[i].within && rangeList[i].within === "root"){ 
                parentest = rangeList[i];
                delete parentest["_id"];
                break; //There can only be one range considered the ultimate aggregator.
            }
        }
        return parentest;
    }

    function pullFromStructures(uri, rangeList){
        var pull_this_out = {};
        for(var i=0; i<rangeList.length; i++){
            if(rangeList[i]["@id"] === uri){
                pull_this_out = rangeList[i];
                delete pull_this_out["_id"];
                break;
            }
        }
        return pull_this_out;
    }
    
    /* Very long URLs like the ones Karen used that do not get saved as an HTTP URL, but a dataurl, cause call stack overflows. */
    function unflatten(flatRanges, parent) {
      var children_uris = [];
      var children = [];
      var canvas_uris = [];
      parent = typeof parent !== 'undefined' ? parent : getParentest(flatRanges);
      if(typeof parent.items !== 'undefined'){ 
        children_uris = parent.items;
      }
      if(typeof parent.canvases !== 'undefined' && parent.canvases.length!==0){
          //it is a leaf, we found it in its order, push its canvases, there will be 2.
          canvas_uris = parent.canvases;
          pushToOrderedSequence(canvas_uris[0]);
          pushToOrderedSequence(canvas_uris[1]);
      }
      for(var i=0; i<children_uris.length; i++){ //get the children in order by their @id property from the structures array
        var new_child = pullFromStructures(children_uris[i], flatRanges);//Remember from earlier, if this was an empty child, we wanted to skip it.  
        if(!jQuery.isEmptyObject(new_child)){ //check if empty
          children.push(new_child); //push to our array if not empty
        }
      }
      if ( children.length ) {
        jQuery.each(children, function( index, child ){unflatten(flatRanges, child);});
      }
    }
    unflatten(rangeCollection);
    manifestCanvases = canvases;
    return canvases;
}

/*
* Helper function for mergeSort().  It mergest the left and right arrays created when splitting the source array in the middle. 
*/
function merge(left, right){
    var result  = [],
        il      = 0,
        ir      = 0;

    while (il < left.length && ir < right.length){
        if (left[il].items.length < right[ir].items.length){
            result.push(left[il++]);
        } else {
            result.push(right[ir++]);
        }
    }

    return result.concat(left.slice(il)).concat(right.slice(ir));
}
/*
* The classic merge sort function that sorts an array of numbers from smallest to largest.  In our case, the array is an array of range objects, but what I test is the length of their ranges[] field, since those with the highest count in the ranges[] field will be top parent objects and the ordered array is easier to build the tree structure from.  Even for an array of 1000 ranges, this runs pretty quick.  
*/
function mergeSort(items){
    if (items.length < 2) {
        return items;
    }

    var middle = Math.floor(items.length / 2),
        left    = items.slice(0, middle),
        right   = items.slice(middle),
        params = merge(mergeSort(left), mergeSort(right));
    
    // Add the arguments to replace everything between 0 and last item in the array
    params.unshift(0, items.length);
    items.splice.apply(items, params);
    return items;
}

