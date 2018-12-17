/* 
 * Get just the pieces for the ordering algorithms out of reform.js and put them here. 
 */



const REform = {}
REform.noStructure = true;  //There needs to be a structure to work with, or we are in initiate mode.
REform.noTop = true;
REform.manifest = {} //keep track of the manifest being used
REform.manifestID = ""; //  http://devstore.rerum.io/v1/id/5c17dbbbe4b05b14fb531efb
REform.top = {} //keep track of the viewingHint: top range
REform.bucket = []; //All the ranges from manifest.structures that are not ordered in the TOC anywhere. 

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
    .then(resp => jsonReturn = resp.json())
    .catch(error => REform.unhandled(error))
    return jsonReturn;
}
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
    .then(resp => jsonReturn = resp.json())
    .catch(error => REform.unhandled(error))
    return jsonReturn;
}
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
    .then(resp => jsonReturn = resp.json())
    .catch(error => REform.unhandled(error))
    return jsonReturn;
}
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
    return jsonReturn;
}
REform.crud.query = async function (obj){
    let url = "query"
    let jsonReturn = {};
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
    return jsonReturn;
}

REform.local.create = function (obj){
    
}

REform.local.update = function (obj){
    
}

REform.local.delete = function (obj){
    
}

REform.local.getByID = function (obj){
    
}

/*
 * Create queued ranges and update existing ranges up to the top range
 * to represent the new structure created.
 * @return {undefined}
 */
REform.local.commitStrcturalChanges = function (){
    
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
            if(!item.hasClass('selected'))item.addClass('selected');
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
                element.addClass("selected");
                element.addClass("hidden");
            }
            helper.css("width", hlpWidth);
            return helper;
        },
        start: function (e, ui) {
            var elements =$(".selected.hidden").not(".helper");
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
                $(".selected").removeClass("selected");
                return false;
            }
            var clonedSet = $(ui.item.data('items').clone());
            clonedSet.removeClass("hidden selected");
            // you must clone the set or the original ui.item will not be present after replaceWith()
            $(ui.item).replaceWith(clonedSet);
            $('.hidden').remove();
            $(".selected").removeClass("selected");
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

REform.askForNewTitle = function(depth){
    let area = document.querySelectorAll('[depth="'+depth+'"]')
}

REform.newGroupForm = function (depth, bool){
    
}

REform.changeLabel = function(rangeID, bool, event){
    
}

REform.unhandled = function(error){
    console.log("There was an unhandled error when using fetch");
    console.log(error);
    throw Error(error);
    return error;
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
        throw Error("HTTP Error: "+response.statusText);
    }
    return response;
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
        "items":[]
    };
}

/*
 * By now we know the manifest, the manifest structures and the top range (or lack thereof)
 * We need to trace the map of the structures presented by the ranges and put anything that is outside
 * of the TOC into the bucket.  In this function, we only care about what goes into the bucket.  
 * @return {undefined}
 */
REform.generateBucket = async function(){
    let bucketRanges = []; //ignore these
    let unorderedRanges = []; //Put these into bucket
    let bucketRanges = REform.manifest.structures.filter(o => o.type === "Range");
    
    /*
     * A range that has range.items is handed to this function.  Go over each item
     * and remove from the set of all ranges.
     * Recurse so that it goes over all ranges contained in any range.items array. 
     * @param {type} topLevelRangse
     * @return {undefined}
     */
    function traceMap(topLevelRangse){
        for(range in topLevelRanges.items){
            let itemToRecurse = topLevelRanges.items[range];
            let nextLevelRanges = itemToRecurse.items.filter(o => o.type === "Range");
            bucketRanges.filter(o => o.id === itemToRecurse.id);
            traceMap(nextLevelRanges);
        }
    }
    
    
    if(REform.noTop){
        //There is no top level range.  Everything will end up in the bucket.  
        for(struct in bucketRanges){
            let range = REform.manifest.structures[struct]
            let rangeObj = {};
            if(typeof rangeObj === "string"){
                rangeObj = await REform.resolveForJSON(range);
            }
            else if(typeof rangeObj === "object"){
                rangeObj = range;
            }
            bucketRanges.push(rangeObj);
        }
        bucketRanges = allRanges
    }
    else{
        //We have a top level range.  Start with that range and initiate recursion to go over
        //ever ranges's items array.  For each item you find, remove it from the array
        //of all ranges.  What you are left with is what belongs in the bucket.  
        let topLevelRange = JSON.parse(JSON.stringify(REform.top));
        allRanges.filter(o => o.id === topLevelRange.id);
        let topLevelRanges = topLevelRange.items.filter(o => o.type === "Range");
        traceMap(topLevelRanges);
    }
    
    return bucketRanges;   
}

/**
 * 
 * @param {type} manifestObj
 * @return {Array, REform.findTopRange.manifestStructures, REform.findTopRange.rangeObj}
 */
REform.findTopRange = function(manifestObj){
    let manifestStructures = (manifestObj.structures) ? manifestObj.structures : [];
    let topRange = {};
    let topFound = false;
    if(manifestStructures.length > 0){
        REform.noStructure = false;
        for(entry in manifestStructures){
            let rangeObj = {};
            if(typeof manifestStructures[entry] === "string"){
                rangeObj = resolveForJSON(manifestStructures[entry])
            }
            else if(typeof manifestStructures[entry] === "object" ){
                rangeObj = manifestStructures[entry];
            }
            if(rangeObj.viewingHint && rangeObj.viewingHint === "top"){
                REform.noTop = false;
                if(topFound){
                    console.log("Error in manifest, found 2 top ranges.  What should i do?");
                }
                else{
                    //dont break or return, lets check if there happens to be more than one in the manifest structures.
                    topFound = true;
                    topRange = rangeObj;
                }
            }
        }
    }
    else{
        REform.noStructure = true;
    }
    return topRange;
}

/**
 * 
 * @param {type} manifestID
 * @return {undefined}
 */
REform.gatherTOC = async function(){
    let manifestID = getURLVariable("manifest");
    let manifest = await resolveForJSON(manifestID);
    REform.manifest = manifest;
    REform.top = REform.findTopRange(manifest);
    let tocRangesHTML = "";
    if(Object.keys(REform.top).length === 0 && REform.top.constructor === Object){
        //There is no top object, so we can't begin to structure anything
        //Everything goes in the bucket of unstructuresd ranges
        REform.structureAlert();
        REform.showTopRangeCreation();
    }
    else{
        //We found ranges and most importantly the TOP range, let's draw it.
        tocRangesHTML = REform.drawChildRanges("1", REform.top);
        document.getElementById("toc").innerHTML = tocRangesHTML
    }
    //Now we need to trace the ranges map to figure out what does and does not belong in the bucket
    let bucketRangesHTML = "<span>UNASSIGNED</span>"+REform.generateBucket();
    document.getElementById("bucket").innerHTML = bucketRangesHTML
}

/**
 * 
 * @param {type} id
 * @return {unresolved}
 */
REform.resolveForJSON = async function(id){
    let j = {}
    await fetch(id)
        .then(REform.handleHTTPError)
        .then(resp => j = resp.json())
        .catch(error => REform.unhandled(error))
    return j
}

/*
 * Show the children internal to the range you just clicked by expanding it into a parent range
 * or close all expansions down to the level of an already selected child you clicked. 
 * @param {type} event
 * @param {type} rangeObj
 * @return {undefined}
 */
REform.toggleChildren = function(event, rangeObj){
    let childClicked = event.target
    if(childClicked.classList.contains("selectedSection")){
        let depthToCollapseTo = childClicked.getAttribute("inDepth")
        REform.collapseTo(event, depthToCollapseTo)
    }
    else{
        REform.drawParentRange(event, rangeObj)
    }
}

/*
 * 
 * @param {type} rangeObj
 * @return {undefined}
 */
REform.drawParentRange = function(event, rangeObj){
    let childClicked = event.target;  
      
    let topBool =(rangeObj.viewingHint && rangeObj.viewHint === "top") ? true : false
    let thisRangeDepth = document.querySelectorAll('.rangeArrangementArea').length + 1
    let rangeLabel = (rangeObj.label && rangeObj.label !== "top") ? rangeObj.label : "Unlabeled"
    let childRangesHTML = drawChildRanges(thisRangeDepth, rangeObj);
    let rangeID = (rangeObj["@id"]) ? rangeObj["@id"] : (rangeObj.id) ? rangeObj.id : "id_not_found"

    let parentRangeHTML = 
    `
        <div class="rangeArrangementArea parent" depth="${thisRangeDepth}" rangeID="${rangeID}">
            <div class='columnActions'>
                <input class="makeGroup" value="merge" type="button" onclick="askForNewTitle("${thisRangeDepth}")"/>
                <input class="addGroup" value="add" type="button" onclick="newGroupForm("${thisRangeDepth}", false);"/>
                <input class="makeSortable" value="sort" type="button" onclick="makeSortable("${thisRangeDepth}");"/>
                <input class="doneSortable" value="done" type="button" onclick="stopSorting("${thisRangeDepth}");"/><br>
            </div>
            <div class="rAreaLabel">${rangeLabel}</div>
            <div ondragover='dragOverHelp(event);' ondrop='dropHelp(event);' class="notBucket childRangesContainer">${childRangesHTML}</div>
        </div>
    `
    document.getElementById("rangeContainer").appendChild(parentRangeHTML);
}

/*
 * 
 * @param {type} depth
 * @param {type} rangeObj
 * @return {String}
 */
REform.drawChildRanges = async function(depth, rangeObj){
    let childRanges = (rangeObj.ranges) ? rangeObj.ranges : [];
    let childRangesHTML = "";
    for(let i=0; i< childRanges.length; i++){
        let childObj = {}
        let range = childRanges[i]
        if(typeof range === "string"){
            //Need to resolve to have object and store that to localStorage
            childObj = await resolveForJSON(range)
        }
        else{
            //presumably, it is an object already, so we don't need to resolve it.
            childObj = range
        }
        let uniqueID = document.querySelectorAll('.child').length + i;
        let outerRangeLabel = childObj.label+" <br>"
        let tag = "parent"
        let relation = ""
        let isLeaf = false
        let isOrdered = childObj.isOrdered
        let dragAttribute = `" id="drag_${uniqueID}_tmp" draggable="true" ondragstart="dragHelp(event);" ondragend="dragEnd(event);"`
        let dropAttribute = `" ondragover="dragOverHelp(event);" ondrop="dropHelp(event);"`
        let checkbox = " <input onchange='highlighLocks($(this).parent(), \"merge\");' class='putInGroup' type='checkbox' />"
        let rightClick = " oncontextmenu='breakUpConfirm(event); return false;'"
        let lockStatusUp = childObj.lockedup
        let lockStatusDown = childObj.lockeddown
        let lockit = (lockStatusDown === "false")
        if(lockStatusDown === "false"){
            lockit = `<div class='lockUp' onclick="lock("${relation}",event);"> </div>`
            //console.log("outer with lock status, not draggable");
        }
        else if(lockStatusDown === "true"){
            lockit = `<div class='lockedUp' onclick="unlock("${relation}",event);"> </div>`
        }
        let childHTML = 
        `
        <div inDepth="${depth}" class="arrangeSection child sortOrder" isOrdered="${isOrdered}" lockedup="${lockStatusUp}" lockeddown="${lockStatusDown}"
        ${dropAttribute} ${dragAttribute} ${rightClick} leaf=${isLeaf} 
        onclick="REform.toggleChildren(event, ${childObj})" class="arrangeSection ${tag}" rangeID="${relation}">
            <span>${outerRangeLabel}</span> 
            ${checkbox} 
            ${lockit}  
        </div>
        `
        childRangesHTML += childHTML;
    }
    return childRangesHTML;
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
   let stopAt = Number(depth);
   for(let i = deepest; i > stopAt; i--){
       //Ex child clicked was in depth 3, there are 5 depths open.  Collapse 5, collapse 4, stop at 3
       let elemToRemove = document.querySelectorAll('[depth="'+i+'"]')
       elemToRemove.parentNode.removeChild(elemToRemove)
   }
}

REform.designateTop = function (rangeObj){
    //designate range as viewingHint: top
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

REform.updateURL = function (piece, classic){
    var toAddressBar = document.location.href;
    //If nothing is passed in, just ensure the projectID is there.
    //console.log("does URL contain projectID?        "+getURLVariable("projectID"));
    if(!getURLVariable("projectID")){
        toAddressBar = "?projectID="+tpen.project.id;
    }
    //Any other variable will need to be replaced with its new value
    if(piece === "p"){
        if(!getURLVariable("p")){
            toAddressBar += "&p=" + tpen.project.folios[tpen.screen.currentFolio].folioNumber;
        }
        else{
            toAddressBar = replaceURLVariable("p", tpen.project.folios[tpen.screen.currentFolio].folioNumber);
        }
        var relocator = "buttons.jsp?p="+tpen.project.folios[tpen.screen.currentFolio].folioNumber+"&projectID="+tpen.project.id;
        $(".editButtons").attr("href", relocator);
    }
    else if (piece === "attempts"){
        if(!getURLVariable("attempts")){
            toAddressBar += "&attempts=1";
        }
        else{
            var currentAttempt = getURLVariable("attempts");
            currentAttempt = parseInt(currentAttempt) + 1;
            toAddressBar = replaceURLVariable("attempts", currentAttempt);
        }
    }
    window.history.pushState("", "T&#8209;PEN 2.8 Transcription", toAddressBar);
}

REform.replaceURLVariable = function (variable, value){
       var query = window.location.search.substring(1);
       var location = window.location.origin + window.location.pathname;
       var vars = query.split("&");
       var variables = "";
       for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){
            var newVar = pair[0]+"="+value;
            vars[i] = newVar;
            break;
        }
       }
       variables = vars.toString();
       variables = variables.replace(/,/g, "&");
       return(location + "?"+variables);
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
    var parent;
    var canvases = [];

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
      if(typeof parent.ranges !== 'undefined'){ 
        children_uris = parent.ranges;
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
        if (left[il].ranges.length < right[ir].ranges.length){
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