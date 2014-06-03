//SET GLOBALS

//Offline
//var sAPIURL = 'http://localhost/MyLocalMenu/API/api.php';

//Online
var sAPIURL = 'http://mylocalcafe.dk/API/api.php';

window.onload = function(){
     
    CheckInternetConnection();
    
    //getMessagesAndStamps();
    makeFavorits();
    CheckForsCustomerId();
    
    $(".ui-btn").on( "swiperight", FavoritDelete );
};

function AutocompleteCafename() {
   
   //Check if FindCafe input element is empty
   if($('#FindCafe').val().length === 0) {
       $('#searchWrapper').html('');
   }
   
   if($('#FindCafe').val().length >= 3) {
       //console.log('search');
       var sCafename = $('#FindCafe').val();
       
       $.ajax({
              type: "GET",
              url: sAPIURL,
              dataType: "jSON",
              data: {sFunction:"AutocompleteCafename",sCafename:sCafename}
             }).done(function(result){
                 if(result.result == 'true') {
                 //Clear the list
                 $('#searchWrapper').html('');
                 $('#searchWrapper').append('<h6>Søge resultater</h6>');
                 $.each(result.cafe, function(key,value){
                     //console.log('name: '+value);
                     //Show list of posible cafenames
                     
                     //escape single quoates from string 
                     var name = value.name.replace(/'/g, "\\'");
                     
                     $('#searchWrapper').append('<div class="searchItemWrapper"><a class="ui-btn"  onclick="findMenuCardAutocomplete(\''+name+'\');">'+value.name+'<p>'+value.address+'</p></a></div>');
                 }); 
                 }
             });
       
   }
}



function CheckForsCustomerId() {
    
    //Check for sCustomerId in localStorage
    if(localStorage.getItem("sCustomerId") === null || localStorage.getItem("sCustomerId") === '') {
        //If no sCutomerId then create new sCutomerId
        localStorage.setItem("sCustomerId",MakeRandomId());
    }  
}

function MakeRandomId()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 25; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function CheckInternetConnection() {
    //var status = navigator.onLine;
    //if( status === true ){
    if( window.jQuery ){
        //App is online
    }
    else {
        $('#Offline').show();
    }
}   

function InfoToggle(){
   // $("#infoBlock .dishPoint").show();
  //  $("#infoBlock").slideToggle(400);
    $("#infoBlock .dishPoint").toggleClass('out');
    var scrollTop = $("#menu").scrollTop();
    if( scrollTop >= 150 ){
        $("#menu").animate({ scrollTop: 0 }, 400);
    }
}

function MessageToggle() {
   // $("#messageBlock").slideToggle(100);
   //Check if there are message to display
   if($('.messageBlock').html() !== '') {
    $(".messageBlock").toggleClass('out');
    }else {
        $('.messageBlock').append('<li><p></p><h1></h1><h2>Der er ingen beskeder at vise!</h2></li>');
        $(".messageBlock").toggleClass('out');
    }
}

function MenucardItemsToggle(num) {
  // $(".MenucardCategoryGroup"+num+" .dishPoint").slideToggle();
    $(".MenucardCategoryGroup"+num+" .dishPoint").toggleClass('out');
}

function FavoritDelete() {
    
    var widthBlock = $(this).width();
    var widthWindow = $( window ).width();
    var Id = $(this).attr("id");

    $(this).before('<div class="FavoritDeleteTjek" id="'+Id+'Wrapper"><a id="'+Id+'Del" href="#">Slet</a><p>.</p><a id="'+Id+'Cancel" href="#">Fortryd</a> </div>');
    
    
    $(this).css({
        width: widthBlock+"px"
    });
    $(this).animate({ marginLeft: widthWindow+"px"} , 200, function() {
        
        $("#"+Id+"Del").click( function(){
            $('#'+Id).parent().remove();
             
            var aUserFavorits = JSON.parse(localStorage.getItem("aUserFavorits"));
            
            var iUserFavorits = Object.keys(aUserFavorits).length;
            
            for(var i = 0; i < iUserFavorits; i++){
                if( aUserFavorits[i]['iMenucardSerialNumber'] === Id){
                    delete aUserFavorits[i];
                    aUserFavorits[i] = '';
                }
            }
            localStorage.setItem("aUserFavorits", JSON.stringify(aUserFavorits));
            
            //TODO: Also remove the cafeAddress and cafeName
            
         //     var iUserFavorits = Object.keys(aUserFavorits).length;
              
            
           // aUserFavorits[iUserFavorits]= sSerialNumberCaps;

           //   localStorage.setItem("aUserFavorits", JSON.stringify(aUserFavorits));
           //   var MyFavorits = JSON.parse(localStorage.getItem("aUserFavorits"));
            
            
        });
        
        $("#"+Id+"Cancel").click( function(){
            var newWidth = $('#favoriteWrapper').width();
            $('#'+Id).css({width: newWidth - 20 +"px"});
            $('#'+Id).animate({ marginLeft: 0+"px"});
            $('#'+Id+'Wrapper').remove();
        });
    });
}

function makeFavorits() {
    $("#favoriteWrapper").empty();
    var aUserFavorits = JSON.parse(localStorage.getItem("aUserFavorits"));
    var iUserFavorits = Object.keys(aUserFavorits).length;
    
    if(iUserFavorits > 0){
        $("#favoriteWrapper").append("<h6>FAVORITTER</h6>");
        for(var i = 0; i < iUserFavorits; i++){
            if(aUserFavorits[i].iMenucardSerialNumber !==  undefined) {
                var sCafeId = aUserFavorits[i].iMenucardSerialNumber;
                var sCafeName = aUserFavorits[i].cafename;
                var sCcafeAdress = aUserFavorits[i].cafeaddress;

                $("#favoriteWrapper").append('<div class="favoriteItemWrapper"><a id="'+sCafeId+'" href="#" data-transition="slide" class="ui-btn" onclick="GetMenucardWithSerialNumber(\''+sCafeId+'\');">'+sCafeName+'<p>'+sCcafeAdress+'</p></a></div>');
            }
        }
    }
}

function getMessagesAndStamps() {
       var aUserFavorits = JSON.parse(localStorage.getItem("aUserFavorits"));
       var aData = {};
       var menucards = {};
       $.each(aUserFavorits,function(index, val){
           if(index >0){
               menucards[index] = val;
           }  
       });
       //Get the sCustomerId in localStorage
       menucards['sCustomerId'] = localStorage.getItem("sCustomerId");
       aData = menucards;
       //Workaround with encoding issue in IE8 and JSON.stringify
       for (var i in aData) {
           aData[i] = encodeURIComponent(aData[i]);
       }

       var sJSON = JSON.stringify(aData);
       
       //Make ajax call
   $.ajax({
        type: "GET",
        url: sAPIURL,
        dataType: "json",
        data: {sFunction:"GetMessagesAndStampsApp",sJSONMenucards:sJSON}
       }).done(function(result) 
       {
           if(result.result === true){
               // tjek om beskeder fra app
               
               //opret nye new meggages
               $(".newMgs").remove();
               $.each(result.Menucards, function(index,val){

                        var sMessageDate = val.Messages[0].dtMessageDate;
                        var PrevMessageDate = localStorage.getItem(index+".message");
                        if (sMessageDate === PrevMessageDate ){
                            $("#"+index+" .newMgs").remove();
                        }
                        else {
                            $("#"+index).append("<div class='newMgs'><p></p><div>");
                        }
                        // sæt antal stempler på menukortet
                        var Stamps = val.iNumberOfStamps;
                        if ( Stamps == null ) { var Stamps = 0; }
                        localStorage.setItem(index+".stamps", Stamps);
                        // gem stempelkort tekst
                        localStorage.setItem(index+".sStampcardText", val.sStampcardText);
                });           
            }
            else{
            }
       });
}

function findMenuCard() {
    if($("#FindCafe").val() !== '') {
        $("#FindCafe").before('<div class="spinner"><div class="bar"></div></div>');
        var value = $("#FindCafe").val();
        //GetMenucardWithSerialNumber(value);
        GetMenucardWithRestuarentName(value);
    }else {
        $('#FindCafe').before('<div class="popMgs">Skriv venligt et navn i søgeboksen</div>');
        $('.popMgs').hide().fadeIn().delay(500).fadeOut(4300,function(){ $(this).remove(); }); 
    }
}

function findMenuCardAutocomplete(name) {
    GetMenucardWithRestuarentName(name);
}

function GetMenucardWithRestuarentName(sRestuarentName) {

    $("#menu").empty();
    addHeader(sRestuarentName);
    var sRestuarentNameSearch = sRestuarentName;
    
    //Get data            
            $.ajax({
              type: "GET",
              url: sAPIURL,
              dataType: "jSON",
              data: {sFunction:"GetMenucardWithRestuarentName",sRestuarentName:sRestuarentName}
             }).done(function(result){
                 
             if(result.result === true){
                    $(".spinner div").css('animation-name', 'none');
                    $(".spinner div").css('width', '100%');
                    $(".spinner").remove();
                    
                    $.mobile.changePage("#menu", {
                        transition: "slide"
                    });
                    var sRestuarentName = result.sRestuarentName; 
                    var sRestuarentAddress = result.sRestuarentAddress;
                    $("#menu").append('<div class="menuheader"><h1>'+sRestuarentName+'</h1><img class="img_left" src="img/message.png" onclick="MessageToggle();"><p>'+sRestuarentAddress+'</p><p>'+result.iRestuarentInfoZipcode+', '+result.sRestuarentInfoCity+'</p><img class="img_right" onclick="InfoToggle();" src="img/info.png"></div>');
                    $("#menu").append("<ul></ul>");
                    $("#menu ul").append('<div id="messageBlock" onclick="MessageToggle();"><ul class="messageBlock"></ul></div>');
                    $("#messageBlock").after('<div id="infoBlock"></div>');
                    $("#infoBlock").append('<li class="dishPoint"><h1>info</h1></li>');
                    var sRestuarentPhone = result.sRestuarentPhone;
                    var sRestuarentPhoneFormat = sRestuarentPhone.substring(0, 2)+' '+sRestuarentPhone.substring(2, 4)+' '+sRestuarentPhone.substring(4, 6)+' '+sRestuarentPhone.substring(6, 8);
                    $("#infoBlock").append('<li class="dishPoint PhoneNumber"><img src="img/call up.png"><a href="tel:'+sRestuarentPhone+'" rel="external">'+sRestuarentPhoneFormat+'</a></li>');
                    $("#infoBlock").append('<li class="dishPoint" id="OpeningHours"></li>');
                    
                    $.each(result.aMenucardOpeningHours, function(key,value){
                            var OpeningHours = {
                                         sDayName: value.sDayName,
                                         iTimeFrom: value.iTimeFrom,
                                         iTimeTo: value.iTimeTo,
                                         iClosed: value.iClosed
                                     };
                            if(OpeningHours.iClosed === '0'){
                                $("#OpeningHours").append('<h1>'+OpeningHours.sDayName+'</h1><h2>'+OpeningHours.iTimeFrom+' - '+OpeningHours.iTimeTo+'</h2><br>');
                            }else if(OpeningHours.iClosed === '1'){                              
                               $("#OpeningHours").append('<h1>'+OpeningHours.sDayName+'</h1><h2>Lukket</h2><br>');
                            }
                            }); 
                    $.each(result.aMenucardInfo, function(key,value){
                            var Info = {
                                         sMenucardInfoHeadline: value.sMenucardInfoHeadline,
                                         sMenucardInfoParagraph: value.sMenucardInfoParagraph
                                     };
                            $("#infoBlock").append('<li li class="dishPoint">'+Info.sMenucardInfoHeadline+'<p>'+Info.sMenucardInfoParagraph+'</p></li>');
                    }); 
                    
                    $("#infoBlock").append('<li class="dishPoint button" onclick="InfoToggle();"><img src="img/arrowUp.png"></li><br>');

                    $.each(result.aMenucardCategory, function(key,value){
//                              alert('liste index: '+key);
                              var category = {
                                  sMenucardCategoryName: value.sMenucardCategoryName,
                                  sMenucardCategoryDescription: value.sMenucardCategoryDescription,
//                                  iMenucardCategoryIdHashed: value.iMenucardCategoryIdHashed,
                                  items:[]
                              };
                             $("#menu").append("<ul class='MenucardCategoryGroup"+key+"'></ul>");
                             $(".MenucardCategoryGroup"+key).append('<li class="dishHeadline" onclick="MenucardItemsToggle('+key+');">'+category.sMenucardCategoryName+'<p>'+category.sMenucardCategoryDescription+'</p></li>');
                             
                             if(typeof result['aMenucardCategoryItems'+key].sMenucardItemName !== "undefined") {
                             
                              $.each(result['aMenucardCategoryItems'+key].sMenucardItemName, function(keyItem,value){

                                  var sMenucardItemName = value;
                                  var sMenucardItemDescription = result['aMenucardCategoryItems'+key].sMenucardItemDescription[keyItem];
                                  var iMenucardItemPrice = result['aMenucardCategoryItems'+key].iMenucardItemPrice[keyItem];
//                                  var iMenucardItemIdHashed = result['aMenucardCategoryItems'+key].iMenucardItemIdHashed[keyItem];
//                                  var iMenucardItemPlaceInList = result['aMenucardCategoryItems'+key].iMenucardItemPlaceInList[keyItem];
                                  
                                  var item = {
                                      sMenucardItemName: sMenucardItemName,
                                      sMenucardItemDescription: sMenucardItemDescription,
//                                      sMenucardItemNumber: sMenucardItemNumber,
                                      iMenucardItemPrice: iMenucardItemPrice
//                                      iMenucardItemIdHashed: iMenucardItemIdHashed,
//                                      iMenucardItemPlaceInList: iMenucardItemPlaceInList
                                  };
                                  //Append the item to the items in the category obj
//                                  category.items.push(item);
                                  $(".MenucardCategoryGroup"+key).append('<li class="dishPoint"><h1>'+item.sMenucardItemName+'</h1><h2>'+item.iMenucardItemPrice+',-</h2><p>'+item.sMenucardItemDescription+'</p></li>');
                              });

                              }
                          
                          });
                          
                          // generate StampCard
                            $(".StampCardWrapper").empty();
                            var iMenucardSerialNumber = result.iMenucardSerialNumber;
                            var userStamps = localStorage.getItem(iMenucardSerialNumber+".stamps");
                            var userStampsCheck = userStamps;
                            var stampsForFree = result.oStampcard.iStampcardMaxStamps;
                            
                            var rest = userStamps - stampsForFree;
                            
                            if(userStampsCheck == '0') {
                                $(".StampCardWrapper").prepend("<div class='StampCard'><h1>STEMPLEKORT1</h1><h2>Du har 0 stempler og mangler "+rest+" for at få en gratis "+localStorage.getItem(iMenucardSerialNumber+".sStampcardText")+"</h2></div>");                              
                                for(var l=userStamps; l<stampsForFree; l++){
                                    $(".StampCard").append("<div class='Stamp'></div>");
                                }
                            }
                            for(var i=0; userStamps>0; i++){
                                if(userStamps >= stampsForFree){
                                    $(".StampCardWrapper").prepend("<div class='StampCard "+i+"'><h1>STEMPLEKORT2</h1><h2>Du har 1 gratis "+localStorage.getItem(iMenucardSerialNumber+".sStampcardText")+"</h2></div>");
                                    for(var j=1; j<=stampsForFree; j++){
                                    $(".StampCard."+i).append("<div class='Stamp Full'></div>");
                                    }
                                    $(".StampCard."+i).append('<a href="#HandInCard" onclick="makeHandinPage(\''+iMenucardSerialNumber+'\',\''+stampsForFree+'\');" class="ui-btn">Indløs kort</a>');
                                }
                                else {                  
                                    $(".StampCardWrapper").prepend("<div class='StampCard "+i+"'><h1>STEMPLEKORT3</h1><h2>Du har "+userStamps+" stempler og mangler "+rest+" for at få en gratis "+localStorage.getItem(iMenucardSerialNumber+".sStampcardText")+"</h2></div>");
                                    for(var k=1; k<=userStamps; k++){
                                    $(".StampCard."+i).append("<div class='Stamp Full'></div>");
                                    }
                                    for(var l=userStamps; l<stampsForFree; l++){
                                    $(".StampCard."+i).append("<div class='Stamp'></div>");
                                    }
                                }
                                userStamps = userStamps - stampsForFree;
                            }
                            
                          
                          
                          // Opret Besked
//                            $("#messageBlock").show();
//                            $("#messageBlock ul").empty();
//                            //Check for messages
//                            if(typeof result.oMessages[0] !== "undefined") {
//                                var sMessageHeadline = result.oMessages[0].headline;
//                                if(sMessageHeadline !== '') {
//                                    var sMessageBodyText = result.oMessages[0].bodytext;
//                                    var sMessageDate = result.oMessages[0].date;
//                                    var sMessageDate = sMessageDate.substring(0,10);
//                                    $("#messageBlock ul").append("<li><p>"+sMessageDate+"</p><h1>"+sMessageHeadline+"</h1><h2>"+sMessageBodyText+"</h2></li>");
//                                }
//                            }
                            
                            
                          $("#messageBlock ul").empty();
                          if(typeof result.oMessages[0] !== "undefined") {
                              
                                var sMessageHeadline = result.oMessages[0].headline;
                                var sMessageBodyText = result.oMessages[0].bodytext;
                                var sMessageDate = result.oMessages[0].date;
                                var sMessageDateCut = sMessageDate.substring(0,10);
                                $("#messageBlock ul").append("<li><p>"+sMessageDateCut+"</p><h1>"+sMessageHeadline+"</h1><h2>"+sMessageBodyText+"</h2></li>");
                                var sSerialNumber = result.iMenucardSerialNumber;
                                var PrevMessageDate = localStorage.getItem(sSerialNumber+".message");

                                // tjek if massege is Seen
                                if( sMessageDate == PrevMessageDate){
                                    $(".messageBlock").removeClass('out');
                                }
                                else {
                                  $(".messageBlock").addClass('out');

                                  localStorage.setItem(sSerialNumber+".message", sMessageDate);
                                }
                          }
                          
                          
                          //Save user favorites
                          
                           // Set objects
                          var aMenucard = {};
                          
                          //Get the old user favorites
                          var aUserFavorites = JSON.parse(localStorage.getItem("aUserFavorits"));
                          //alert('aUserFavorites before '+aUserFavorites);
                          if(aUserFavorites !== null) {
                              
                            //Check if menucard is in localStorage.aUserFavorites
                            var bNewMenucard = false;
                            $.each(aUserFavorites, function(keyItem,value){
                                //alert('JSON: '+value.iMenucardSerialNumber+' -- New '+iMenucardSerialNumber);                           
                                if(value.iMenucardSerialNumber !== iMenucardSerialNumber) { 
                                    bNewMenucard = true;
                                }else {
                                    //alert('findes allerede: '+value.iMenucardSerialNumber);
                                    bNewMenucard = false;
                                    //Break foreach
                                    return false;
                                }
                            });
                            if(bNewMenucard === true) {
                                 var favoritesLength = Object.keys(aUserFavorites).length;                                              

                                    aMenucard['iMenucardSerialNumber'] = iMenucardSerialNumber;
                                    aMenucard['cafename'] = sRestuarentName;
                                    aMenucard['cafeaddress'] = sRestuarentAddress;

                                    aUserFavorites[favoritesLength] = aMenucard;
                                    aUserFavorites = JSON.stringify(aUserFavorites);
                                    localStorage.setItem("aUserFavorits", aUserFavorites);
                                    //alert('insert new menucard');
                                    // make favorit block
                                    $("#favoriteWrapper").append('<div class="favoriteItemWrapper"><a id="'+iMenucardSerialNumber+'" href="#" data-transition="slide" class="ui-btn" onclick="GetMenucardWithSerialNumber(\''+iMenucardSerialNumber+'\');">'+sRestuarentName+'<p>'+sRestuarentAddress+'</p></a></div>');
        
                            }
                          }else {
                              
                             var aUserFavorites = {}; 
                             aMenucard['iMenucardSerialNumber'] = iMenucardSerialNumber;
                             aMenucard['cafename'] = sRestuarentName;
                             aMenucard['cafeaddress'] = sRestuarentAddress;
                            
                             aUserFavorites[0]= aMenucard;
                             aUserFavorites = JSON.stringify(aUserFavorites);
                             //alert('aUserFavorites firsttime: '+aUserFavorites);                           
                             localStorage.setItem("aUserFavorits", aUserFavorites); 
                             
                             //make favorit block
                             $("#favoriteWrapper").append('<div class="favoriteItemWrapper"><a id="'+iMenucardSerialNumber+'" href="#" data-transition="slide" class="ui-btn" onclick="GetMenucardWithSerialNumber(\''+iMenucardSerialNumber+'\');">'+sRestuarentName+'<p>'+sRestuarentAddress+'</p></a></div>');
                             
                             
                          }
                          
                          // make favorit block
                          if($("#favoriteWrapper").html() === ''){
                              $("#favoriteWrapper").append("<h6>FAVORITTER</h6>");
                          }                        
                          
                          //$("#favoriteWrapper").append('<div class="favoriteItemWrapper"><a id="'+iMenucardSerialNumber+'" href="#" data-transition="slide" class="ui-btn" onclick="GetMenucardWithSerialNumber(\''+iMenucardSerialNumber+'\');">'+sRestuarentName+'<p>'+sRestuarentAddress+'</p></a></div>');
                          $(".ui-btn").on( "swiperight", FavoritDelete );
                                
                }
                else {
                        $(".spinner div").css('animation-name', 'none');
                        $(".spinner div").css('width', '100%');
                        $(".spinner").remove();
                        $('#FindCafe').before('<div class="popMgs">Denne café er endnu ikke medlem af My Local Café. Følg med og like os på facebook. Der kommer hele tiden nye Caféer til.</div>');
                        $('.popMgs').hide().fadeIn().delay(500).fadeOut(4300,function(){ $(this).remove(); });        
                }
            });
}

function GetMenucardWithSerialNumber(sSerialNumber) {

    CheckInternetConnection(); 
    $("#menu").empty();
    addHeader(sSerialNumber);
    var sSerialNumberCaps = sSerialNumber.toUpperCase();
    
    //Get data            
            $.ajax({
              type: "GET",
              url: sAPIURL,
              dataType: "jSON",
              data: {sFunction:"GetMenucardWithSerialNumber",iMenucardSerialNumber:sSerialNumber}
             }).done(function(result){
                 
             if(result.result === true){
                    $(".spinner div").css('animation-name', 'none');
                    $(".spinner div").css('width', '100%');
                    $(".spinner").remove();
                    
                    $.mobile.changePage("#menu", {
                        transition: "slide"
                    });
                    var sRestuarentName = result.sRestuarentName; 
                    var sRestuarentAddress = result.sRestuarentAddress;
                    $("#menu").append('<div class="menuheader"><h1>'+sRestuarentName+'</h1><img class="img_left" src="img/message.png" onclick="MessageToggle();"><p>'+sRestuarentAddress+'</p><p>'+result.iRestuarentInfoZipcode+', '+result.sRestuarentInfoCity+'</p><img class="img_right" onclick="InfoToggle();" src="img/info.png"></div>');
                    $("#menu").append("<ul></ul>");
                    $("#menu ul").append('<div id="messageBlock" onclick="MessageToggle();"><ul class="messageBlock"></ul></div>');
//                    getMessages(sSerialNumberCaps);

                    $("#messageBlock").after('<div id="infoBlock"></div>');
                    $("#infoBlock").append('<li class="dishPoint"><h1>info</h1></li>');
                    var sRestuarentPhone = result.sRestuarentPhone;
                    var sRestuarentPhoneFormat = sRestuarentPhone.substring(0, 2)+' '+sRestuarentPhone.substring(2, 4)+' '+sRestuarentPhone.substring(4, 6)+' '+sRestuarentPhone.substring(6, 8);
                    $("#infoBlock").append('<li class="dishPoint PhoneNumber"><img src="img/call up.png"><a href="tel:'+sRestuarentPhone+'" rel="external">'+sRestuarentPhoneFormat+'</a></li>');
                    $("#infoBlock").append('<li class="dishPoint" id="OpeningHours"></li>');
                    
                    $.each(result.aMenucardOpeningHours, function(key,value){
                            var OpeningHours = {
                                         sDayName: value.sDayName,
                                         iTimeFrom: value.iTimeFrom,
                                         iTimeTo: value.iTimeTo,
                                         iClosed: value.iClosed
                                     };
                            if(OpeningHours.iClosed === '0'){
                                $("#OpeningHours").append('<h1>'+OpeningHours.sDayName+'</h1><h2>'+OpeningHours.iTimeFrom+' - '+OpeningHours.iTimeTo+'</h2><br>');
                            }else if(OpeningHours.iClosed === '1'){
                               $("#OpeningHours").append('<h1>'+OpeningHours.sDayName+'</h1><h2>Lukket</h2><br>');
                            }
                            }); 
                    $.each(result.aMenucardInfo, function(key,value){
                            var Info = {
                                         sMenucardInfoHeadline: value.sMenucardInfoHeadline,
                                         sMenucardInfoParagraph: value.sMenucardInfoParagraph
                                     };
                            $("#infoBlock").append('<li li class="dishPoint">'+Info.sMenucardInfoHeadline+'<p>'+Info.sMenucardInfoParagraph+'</p></li>');
                    }); 
                    
                    $("#infoBlock").append('<li class="dishPoint button" onclick="InfoToggle();"><img src="img/arrowUp.png"></li><br>');

                    $.each(result.aMenucardCategory, function(key,value){
//                              alert('liste index: '+key);
                              var category = {
                                  sMenucardCategoryName: value.sMenucardCategoryName,
                                  sMenucardCategoryDescription: value.sMenucardCategoryDescription,
//                                  iMenucardCategoryIdHashed: value.iMenucardCategoryIdHashed,
                                  items:[]
                              };
                             $("#menu").append("<ul class='MenucardCategoryGroup"+key+"'></ul>");
                             $(".MenucardCategoryGroup"+key).append('<li class="dishHeadline" onclick="MenucardItemsToggle('+key+');">'+category.sMenucardCategoryName+'<p>'+category.sMenucardCategoryDescription+'</p></li>');
                             
                              $.each(result['aMenucardCategoryItems'+key].sMenucardItemName, function(keyItem,value){

                                  var sMenucardItemName = value;
                                  var sMenucardItemDescription = result['aMenucardCategoryItems'+key].sMenucardItemDescription[keyItem];
                                  var iMenucardItemPrice = result['aMenucardCategoryItems'+key].iMenucardItemPrice[keyItem];
//                                  var iMenucardItemIdHashed = result['aMenucardCategoryItems'+key].iMenucardItemIdHashed[keyItem];
//                                  var iMenucardItemPlaceInList = result['aMenucardCategoryItems'+key].iMenucardItemPlaceInList[keyItem];
                                  
                                  var item = {
                                      sMenucardItemName: sMenucardItemName,
                                      sMenucardItemDescription: sMenucardItemDescription,
//                                      sMenucardItemNumber: sMenucardItemNumber,
                                      iMenucardItemPrice: iMenucardItemPrice,
//                                      iMenucardItemIdHashed: iMenucardItemIdHashed,
//                                      iMenucardItemPlaceInList: iMenucardItemPlaceInList
                                  };
                                  //Append the item to the items in the category obj
//                                  category.items.push(item);
                                    
                                  $(".MenucardCategoryGroup"+key).append('<li class="dishPoint"><h1>'+item.sMenucardItemName+'</h1><h2>'+item.iMenucardItemPrice+',-</h2><p>'+item.sMenucardItemDescription+'</p></li>');
                              });


                          
                          });
                          
                          // generate StampCard
                            $(".StampCardWrapper").empty();
                            var userStamps = localStorage.getItem(sSerialNumberCaps+".stamps");
                            var userStampsCheck = userStamps;
                            var stampsForFree = result.oStampcard.iStampcardMaxStamps;
                            //var rest = stampsForFree - userStamps;
                            var sStampcardText =  localStorage.getItem(sSerialNumberCaps+".sStampcardText")
                            
                            if( userStamps == null ) { 
                                    localStorage.setItem(sSerialNumberCaps+".stamps", 0);
                                    var userStamps = 0;
                            }
                            
                         
                            var sNameStamp = "stempler";
                            if ( userStamps == 1 ) { var sNameStamp = "stempel"; }
                            var totalfree = userStamps / stampsForFree;
                            var totalfree = Math.floor(totalfree);
                            var usedstamps = totalfree * stampsForFree;
                            var rest = userStamps - usedstamps;
                            var rest = stampsForFree - rest;
                             
                            $(".StampCardWrapper").append("<h2>samel "+stampsForFree+" stempler og få en gratis "+sStampcardText+"</h2>");
                            if(userStamps == 0){
                                $(".StampCardWrapper").append("<h2>Klik på 'FÅ STEMPLE' for at få det 1. stemple.</h2>");
                            }
                            else{
                                $(".StampCardWrapper").append("<h2>Du har i alt fået <div class='stamp'>"+userStamps+"</div> "+sNameStamp+" af "+sRestuarentName+"</h2>");
                                if(totalfree != 0){
                                    $(".StampCardWrapper").append("<h2>Så du har  <div class='stamp'>"+totalfree+"</div> gratis "+sStampcardText+"</h2>");
                                }
                               $(".StampCardWrapper").append("<h2>.. og mangle <div class='stamp'>"+rest+"</div> stempler for at få en gratis "+sStampcardText+"</h2>");
                            }
//                            for(var i=0; userStamps>0; i++){
//                                
//                                if(userStamps >= stampsForFree){
//                                    $(".StampCardWrapper").prepend("<div class='StampCard "+i+"'><h1>STEMPLEKORT4</h1><h2>Du har 1 gratis "+localStorage.getItem(sSerialNumberCaps+".sStampcardText")+"</h2></div>");
//                                    for(var j=1; j<=stampsForFree; j++){
//                                    $(".StampCard."+i).append("<div class='Stamp Full'></div>");
//                                    }
//                                    $(".StampCard."+i).append('<a href="#HandInCard" onclick="makeHandinPage(\''+sSerialNumberCaps+'\',\''+stampsForFree+'\');" class="ui-btn">Indløs kort</a>');
//
//                                }
//                                
//                                else {                                  
//                                    $(".StampCardWrapper").prepend("<div class='StampCard "+i+"'><h1>STEMPLEKORT-5</h1><h2>Du har "+userStamps+" stempler og mangler "+rest+" for at få en gratis "+localStorage.getItem(sSerialNumberCaps+".sStampcardText")+"</h2></div>");
//                                    for(var k=1; k<=userStamps; k++){
//                                    $(".StampCard."+i).append("<div class='Stamp Full'></div>");
//                                    }
//                                    for(var l=userStamps; l<stampsForFree; l++){
//                                    $(".StampCard."+i).append("<div class='Stamp'></div>");
//                                    }
//                                }
//                                var userStamps = userStamps - stampsForFree;
//                            }
                            
                            
                          // Opret Besked
                          
                          
                          $("#messageBlock ul").empty();
                          if(typeof result.oMessages[0] != "undefined") {
                                var sMessageHeadline = result.oMessages[0].headline;
                                var sMessageBodyText = result.oMessages[0].bodytext;
                                var sMessageDate = result.oMessages[0].date;
                                var sMessageDateCut = sMessageDate.substring(0,10);
                                $("#messageBlock ul").append("<li><p>"+sMessageDateCut+"</p><h1>"+sMessageHeadline+"</h1><h2>"+sMessageBodyText+"</h2></li>");
                                var PrevMessageDate = localStorage.getItem(sSerialNumberCaps+".message");
                                // tjek if massege is Seen
                                if( sMessageDate == PrevMessageDate){
                                    $(".messageBlock").removeClass("out");
                                }
                                else {
                                  $(".messageBlock").addClass("out");
                                  localStorage.setItem(sSerialNumberCaps+".message", sMessageDate);
                                }
                          }
                          
                }
                else {
                        $(".spinner div").css('animation-name', 'none');
                        $(".spinner div").css('width', '100%');
                        $(".spinner").remove();
                        $('#FindCafe').before('<div class="popMgs">'+sSerialNumber+' findes ikke</div>');
                        $('.popMgs').hide().fadeIn().delay(500).fadeOut(300,function(){ $(this).remove(); });        
                }
            });
    }
    
function addHeader() {
        $("#menu").append('<div class="header"><a href="#home" data-transition="slide" data-direction="reverse" id="backButtonL"><img src="img/backBlack.png"></a><h2>MyLocal<span>Cafe</span></h2></div>');
}

function makeHandinPage(serial,maxstamps) {
    $("#HandInBox").html("");
    var userStamps = localStorage.getItem(serial+".stamps");
    var cafeName =  localStorage.getItem(serial+".fav.cafeName");
    var StampsForFree = maxstamps;
   
    $("#HandInBox").append("<div style='display: table; margin:0 auto;'><div class='codebutton'><input type='text' id='RedemeCode1' class='codebutton'></div><div class='codebutton'><input type='text' id='RedemeCode2' class='codebutton'></div><div class='codebutton'><input type='text' id='RedemeCode3' class='codebutton'></div><div class='codebutton'><input type='text' id='RedemeCode4' class='codebutton'></div></div>");
    $("#HandInBox").append("Her indtaster caféen Deres kode for at indløse stempletkortet.");
    $("#HandInBox").append("<a href='' class='ui-btn' id='HandInCardAccept'>Indløs stempelkort</a> ");
    $("#HandInBox").append("<h1>"+cafeName+"</h1>");
    $("#HandInBox").append("<div class='StampCard' id='HandinCard'></div>");
    for(var j=1; j<=StampsForFree; j++){
         $("#HandinCard").append("<div class='Stamp Full'></div>");
    }
    
    $("#HandInCardAccept").click(function(){
        
        if($('#RedemeCode1').val() !== '' && $('#RedemeCode2').val() !== '' && $('#RedemeCode3').val() !== '' && $('#RedemeCode4').val() !== '') {
        
            var sCustomerId =  localStorage.getItem('sCustomerId');
            var sSerialNumber = serial;      
            var StampsLeft = userStamps - StampsForFree;          
            var sRedemeCode = $('#RedemeCode1').val() + $('#RedemeCode2').val() + $('#RedemeCode3').val() + $('#RedemeCode4').val(); 

             $.ajax({
              type: "GET",
              url: sAPIURL,
              dataType: "jSON",
              data: {sFunction:"RedemeStampcard",iMenucardSerialNumber:sSerialNumber,sCustomerId:sCustomerId,sRedemeCode:sRedemeCode}
             }).done(function(result){
                    if(result.result === 'true'){
                            alert('Hurra det lykkedes! Så er der gratis '+localStorage.getItem(iMenucardSerialNumber+".sStampcardText")+' på vej :)');
                            //Only do this when the ajax call is successfull
                            //Set the remening stamps in localStorage
                            localStorage.setItem(serial+".stamps", StampsLeft);
                            
                            $("#HandinCard").fadeOut(1000,function(){
                                $("#HandinCard").remove();
                                GetMenucardWithSerialNumber(serial);
                                $.mobile.changePage("#stamp", {
                                    transition: "slideup"
                                });
                            });
                     }
                     if(result.result === 'wrong redemecode') {
                         alert('Forkert kodeord!');
                     }
            });

        } else {
            alert('Husk at indtaste koden');
        }
    });
}

