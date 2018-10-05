/* 
 * Get just the pieces for the ordering algorithms out of reform.js and put them here. 
 */


/* This can be used to gather ranges on server outside the manifest object.  For now, range collection is set off the manifest object strucutres array. */
function gatherRangesForArrange(which, username){
    //console.log("gather ranges "+which);
    var windowurl = document.location.href;
    var forProject = detectWho();
    var properties={"@type" : "sc:Manifest", "forProject":forProject};
    //this will be superfluous when the annotation store has ranges from other projects
    var url="http://brokenbooks.org/brokenBooks/getAnnotationByPropertiesServlet";
    var params = {"content" : JSON.stringify(properties)};
    if(windowurl.indexOf("demo=1") > -1){
        rangeCollection = testManifest.structures;
        manifestCanvases = testManifest.sequences[0].canvases;
        populateRangesToDOM(which);
    }
    else{
        if(which !== 1){
            console.log("Please wait while we sync the server data to the manifest...");
            $(".mainBlockCover").show();
            $("#syncNotice_load").show();
            syncData(username, url, params, which, true);
        }
    }
}

function syncData(username, url ,params, which, pageLoad){
    var url2 = "http://brokenbooks.org/brokenBooks/getManifest";
    var params2 = {"username":username};
    $.post(url2, params2)
    .done(function(data){
        var server_data = JSON.parse(data);
        var serverSequence = server_data.sequences[0];
        var serverStructures = server_data.structures;
        manifestCanvases = serverSequence.canvases; //from server, not manifest
        rangeCollection = serverStructures; //from server, not manifest
        populateRangesToDOM(which);
        $.post(url, params)
        .done(function(data){
            var manifest_data = JSON.parse(data);
            manifest = manifest_data[0]; //specifically manifest
            manifestID = manifest["@id"];
            $("#manURL").html(manifestID);
            publish(pageLoad); //sync everything at the beginning
        });
    });
    
}

function populateRangesToDOM(which){
    var existingRanges = [];
    var uniqueID = 0;
    var outer = "";
    var placedInUnassigned = false;
    if(which == 1){
        //console.log("populate popover trail");
        outer = $(".popoverTrail");
    }
    else if (which == 2){
        //console.log("populate admin trail");
        outer = $(".adminTrail");
    }
    for(var i = 0; i<rangeCollection.length; i++){
        uniqueID += 1;
        var outerRange = rangeCollection[i]; //We have to look at each range, so at some point each range is the outer range...
        var outerRangeLabel = rangeCollection[i].label+" <br>";
        var existingRangeToUpdate = ""; 
        var tag = "parent";
        var relation = "";
        var isLeaf = false;
        var admin = "";
        var isOrdered = rangeCollection[i].isOrdered; //NEED TO DESIGN THIS TAG IN THE OBJECT
        var currentRange = "";
        var dragAttribute = "id='drag_"+uniqueID+"_tmp' draggable='true' ondragstart='dragHelp(event);' ondragend='dragEnd(event);'";
        var dropAttribute = " ondragover='dragOverHelp(event);' ondrop='dropHelp(event);'";
        var canvases = rangeCollection[i].canvases;
        var checkbox = "<input onchange='highlighLocks($(this).parent(), \"merge\");' class='putInGroup' type='checkbox' />";
        var rightClick = "oncontextmenu='breakUpConfirm(event); return false;'";
        var lockStatusUp = rangeCollection[i].lockedup;
        var lockStatusDown = rangeCollection[i].lockeddown;
        var lockitup = "";
        var lockitdown = "";
        var lockit = "";
        var noLock = false;

        if(rangeCollection[i].parent && rangeCollection[i].parent.indexOf("paggr")>-1 || rangeCollection[i]["@id"].indexOf("parent_aggr") > -1){ 
          tag = "parent pAggr";
          outerRangeLabel = "";
          bucketID = rangeCollection[i]["@id"];
          $("div[rangeid='bucket']").attr("rangeid",rangeCollection[i]["@id"]);
          noLock = true;
        }
        relation = rangeCollection[i]["@id"];

        if(which === 2){
            tag += " sortOrder";
            admin = "admin";
            checkbox = "<input onchange='highlighLocks($(this).parent(), \"merge\");' class='putInGroup' type='checkbox' />";
            //dragAttribute = "id='drag_"+uniqueID+"_tmp' draggable='false' ondragstart='dragHelp(event);' ondragend='dragEnd(event);'";
            if(lockStatusDown === "false"){
                  lockit = "<div class='lockUp' onclick=\"lock('"+relation+"',event);\"> </div>";
                  //console.log("outer with lock status, not draggable");
              }
            else if(lockStatusDown === "true"){
                  lockit = "<div class='lockedUp' onclick=\"unlock('"+relation+"',event);\"> </div>";
              }
        }
        else{
          dragAttribute = "";
          dropAttribute = "";
          rightClick = "";
          checkbox = "";
        }
        if(canvases!==undefined && canvases.length !== 0){
          isLeaf = true;
          tag="child";
          dropAttribute = "";
        }
        else{
          isLeaf = false;
          //checkbox = "";
        }
        if(isOrdered === "true"){
            tag += " ordered";
        }
        if(noLock){ //special case where this is the root range, we do not want to build the lock for it because
            //it will place a lock in the [Table of Contents] heading of that sections.
            lockit = "";
        }
        
        currentRange = $("<div isOrdered='"+isOrdered+"' lockedup='"+lockStatusUp+"' lockeddown='"+lockStatusDown+"'\n\
        "+dropAttribute+" "+dragAttribute+" "+rightClick+" leaf='"+isLeaf+"' onclick=\"toggleChildren($(this), '"+admin+"', event);\" class='arrangeSection "+tag+"' rangeID='"+relation+"'><span>"+outerRangeLabel+"</span> "+checkbox+" "+lockit+"  </div>");
        
        if($.inArray(rangeCollection[i]["@id"], existingRanges) == -1){
          existingRanges.push(rangeCollection[i]["@id"]);
          if(isLeaf){
            allLeaves.push(rangeCollection[i]);
            //if(rangeCollection[i].parent !== undefined){
                //console.log("Put in unassigned."); 
                outer.find(".rangeArrangementArea").find('.unassigned').append(currentRange);
                var oldFolioCount = parseInt(outer.find(".rangeArrangementArea").find('.unassigned').find(".folioCount").find(".countInt").html());
                oldFolioCount = oldFolioCount+1;
                outer.find(".rangeArrangementArea").find('.unassigned').find(".folioCount").find(".countInt").html(oldFolioCount);
            }
            else{
              outer.find(".rangeArrangementArea").find('.notBucket').append(currentRange);
            }
          //}
        }
        else{
          //dragAttribute = "id='drag_"+uniqueID+"165.134.241.141' draggable='true' ondragstart='dragHelp(event);'";
          currentRange = outer.find(".arrangeSection[rangeID='"+rangeCollection[i]["@id"]+"']");
        }
        //Create an html range object that can be added
        var innerRanges = rangeCollection[i].ranges;       
        if(innerRanges.length > 0){ //If there are inner ranges
            var tag2 = "child";
            if(which === 2){
                tag2 += " sortOrder";
            }
            for(var j = 0; j<innerRanges.length;j++){ //go over each inner range
                uniqueID += 1;
                dragAttribute = "id='drag_"+uniqueID+"_tmp' draggable='true' ondragstart='dragHelp(event);' ondragend='dragEnd(event);'";
                var thisRange = innerRanges[j];

                var lockitup2 = "";
                var lockitdown2 = "";
                var lockit2 = "";
                var isLeaf2 = false;
                $.each(rangeCollection, function(){ //check each range in the collection
                    if(this["@id"] === thisRange){ //find the object by ID among the collection.  When you find it, gets its information.
                        var thisLabel = this.label;
                        var thisCanvases = this.canvases;
                        var thisIsOrdered2 = this.isOrdered;
                        var checkbox2 = "<input onchange='highlighLocks($(this).parent(), \"merge\");' class='putInGroup' type='checkbox' />";
                        var lockStatusUp2 = this.lockedup;
                        var lockStatusDown2 = this.lockeddown;
                        //dragAttribute = "id='drag_"+uniqueID+"_tmp' draggable='false' ondragstart='dragHelp(event);' ondragend='dragEnd(event);'";
                        if(which == 2){
                            if(lockStatusDown2 === "false"){
                                lockit2 = "<div class='lockUp' onclick=\"lock('"+this["@id"]+"',event);\"> </div>";
                                //console.log("outer with lock status, not draggable");
                            }
                            else if(lockStatusDown2 === "true"){
                                lockit2 = "<div class='lockedUp' onclick=\"unlock('"+this["@id"]+"',event);\"> </div>";
                            }
                        }
                        if(thisCanvases!==undefined && thisCanvases.length !== 0){
                            isLeaf2 = true;
                            dropAttribute = "";
                        }
                        else{
                          isLeaf2 = false;
                          //checkbox2 = "";
                          dropAttribute = " ondragover='dragOverHelp(event);' ondrop='dropHelp(event);'";
                        }
                        if(which == 1){
                          dropAttribute = "";
                          dragAttribute = "";
                          rightClick = "";
                          checkbox2 = "";
                        }
                        var embedRange = "";
                        
                        embedRange = $("<div isOrdered='"+thisIsOrdered2+"' lockedup='"+lockStatusUp2+"' lockeddown='"+lockStatusDown2+"'\n\
                            "+dragAttribute+" "+dropAttribute+" "+rightClick+" onclick=\"toggleChildren($(this), '"+admin+"', event);\" class='arrangeSection "+tag2+"' leaf='"+isLeaf2+"' relation='"+relation+"' rangeID='"+this['@id']+"'><span>"+thisLabel+"</span> "+checkbox2+" "+lockit2+"</div>");
                        if($.inArray(this["@id"], existingRanges) == -1){
                            if(isLeaf2 && rangeCollection[i].parent !== undefined){ //we need to put this leaf into the unassigned area
                                var oldFolioCount = parseInt(outer.find(".rangeArrangementArea").find('.unassigned').find(".folioCount").find(".countInt").html());
                                oldFolioCount = oldFolioCount+1;
                                outer.find(".rangeArrangementArea").find('.unassigned').find(".folioCount").find(".countInt").html(oldFolioCount);
                                outer.find(".rangeArrangementArea").find('.unassigned').append(embedRange);
                            }
                            else{
                                currentRange.append(embedRange);
                            }
                            //$(".rangeArrangementArea").find('.notBucket').append(currentRange);
                            existingRanges.push(embedRange.attr("rangeID"));
                            if(isLeaf2){
                              allLeaves.push(this);
                            }
                        }
                        else{
                            var rangeToMove = outer.find(".arrangeSection[rangeID='"+this["@id"]+"']");
                            if(isLeaf2 && currentRange.attr("class").indexOf("pAggr") > -1 ){
                                //console.log("Leaf in paggr, remains in bucket");
                            }
                            else{
                                currentRange.append(rangeToMove);
                            /* In case of the ranges being wildly out of order, we have to make this check to assure that these children are in fact classed as a child. */
                                rangeToMove.removeClass("parent").addClass("child"); //If we have to embed it, then it is a child.  
                            }

                        }
                    } 
                });
            }
        }
        else{ //There are no inner ranges. It could be a section with no children or a leaf.  

        }
    }
    var pAggrChildren = outer.find('.pAggr').children('div');
    pAggrChildren.removeClass("child").addClass("parent");
    outer.find('.rangeArrangementArea').find('.notBucket').append(pAggrChildren);
        /* In case of the ranges being wildly out of order, we have to make this check to assure the top level nodes are considered parents. */
        //console.log("make paggr children parents");
        //console.log(pAggrChildren);
        //wont work for putInBucket.html?demo=1         
        $.each(pAggrChildren,function(){
            if($(this).attr("id") !== undefined){
                var newID = $(this).attr("id").replace("_tmp", "");
                $(this).attr("id", newID);
            }
        });
        $('.pAggr').remove();    
        //set folio counts for all sections in the admin interface, ignore leaves.
        if(which == 2){
          $.each(outer.find(".arrangeSection"), function(){
             $(this).children(".folioCount").remove();
                var folioCount = $(this).find("div[leaf='true']").length;
                var folioCountHTML = $("<span class='folioCount'><span class='countInt'>"+folioCount+"</span><img class='pageIcon' src='http://brokenbooks.org/brokenBooks/images/b_page.png'/></span>");
                var leafURL = $(this).attr("rangeID");
                if($(this).attr("leaf") === "true"){
                    var leafIsInURL = $(this).parent().attr("rangeID");
                    folioCountHTML = $("<span onclick=\"existing('"+leafURL+"','"+leafIsInURL+"')\" class='folioCount'><img class='leafIcon' src='http://brokenbooks.org/brokenBooks/images/leaf.png'/></span>");
                }
//                else if($(this).attr("isOrdered") === "true"){
//                    folioCountHTML="";
//                }
                $(this).append(folioCountHTML);
           });
        }
        $("#saveText").html("Saving...");
        $("#saveCover").hide();
}

function getURLVariable(variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable){return pair[1];}
    }
    return(false);
}

function updateURL(piece, classic){
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

function replaceURLVariable(variable, value){
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