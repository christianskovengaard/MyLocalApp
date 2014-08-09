//SET GLOBALS

//Offline
//var sAPIURL = 'http://localhost/MyLocalMenu/API/api.php';

//Online
var sAPIURL = 'http://mylocalcafe.dk/API/api.php';

window.onload = function(){
    CheckInternetConnection();
        
    var introSeen = localStorage.length;
    if( introSeen === 0) { 
    AppIntro(); 
    }
    getMessagesAndStamps();
    makeFavorits();
    CheckForsCustomerId();
    
    $(".ui-btn").on( "swiperight", FavoritDelete )

    
};

function ClearSearchInput(){
      $('#FindCafe').val('');
      AutocompleteCafename();
      getMessagesAndStamps();
      $(".clear").hide();
}

function AutocompleteCafename() {
   
   //Check if FindCafe input element is empty
   if($('#FindCafe').val().length === 0 ) {
       $('#searchWrapper').html('');

       // UX-stuff
       $(".logo_home_small").removeClass('logo_home_small').addClass('logo_home');
       $(".clear").hide();
   }
   if($('#FindCafe').val().length === 1) {
       $(".clear").show();
   }
   if($('#FindCafe').val().length >= 3) {
      // UX-stuff
      $(".logo_home").removeClass('logo_home').addClass('logo_home_small');
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

function MenucardItemsToggle(num) {

    $(".MenucardCategoryGroup"+num+" .dishPoint").toggleClass('out');
    $(".MenucardCategoryGroup"+num+" img").toggleClass('rotate');
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
            
            
            //TODO: Remove the empty JSON from localStorage
            
            //TODO: If the localStorage aUserFavorits is empty then remove the 'Favoritter' headline
            
            //TODO: Also remove the cafe stamps
            
           //var iUserFavorits = Object.keys(aUserFavorits).length;
              
            
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
           if(index >=0){
               menucards[index] = val['iMenucardSerialNumber'];
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
                        
                        if(typeof val.Messages !== "undefined") {
                        var sMessageDate = val.Messages[0].dtMessageDate;                     
                        var PrevMessageDate = localStorage.getItem(index+".message");
                        //If only one message has been sent then set a default date
                        if(PrevMessageDate === ''){
                            PrevMessageDate = '0000-00-00 00:00:00';
                        }
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
                        }
                });           
            }
            else{
            }
       });
}

function findMenuCard() {

    if($("#FindCafe").val() !== '') {
        if ($("#FindCafe").val() == "clearmem"){
          localStorage.clear();
          alert('hukommelse tømt');
          location.reload();
        }
        else {
          $("#FindCafe").before('<div class="spinner"><div class="bar"></div></div>');
          var value = $("#FindCafe").val();
          GetMenucardWithRestuarentName(value);
        }
    }
    else {
        $('#FindCafe').before('<div class="popMgs">Skriv venligt et navn i søgeboksen</div>');
        $('.popMgs').hide().fadeIn().delay(500).fadeOut(4300,function(){ $(this).remove(); }); 
    }
}

function findMenuCardAutocomplete(name) {
    GetMenucardWithRestuarentName(name);
}

function GetMenucardWithRestuarentName(sRestuarentName) {

    $("#menu").empty();
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

                    // HEAD

                    var sRestuarentName = result.sRestuarentName; 
                    var sRestuarentAddress = result.sRestuarentAddress;

                    $("#menu").append('<div class="menuheader"><a href="#home" data-transition="slide" data-direction="reverse" id="backButtonL" onclick="ClearSearchInput();"><img src="img/backWhite.png"></a><h1>'+sRestuarentName+'</h1><p>'+sRestuarentAddress+'</p><p>'+result.iRestuarentInfoZipcode+', '+result.sRestuarentInfoCity+'</p><img class="img_right" onclick="InfoToggle();" src="img/info.png"></div>');
                    
                    $("#menu").append("<ul style='margin: 0 auto -20px auto;'></ul>");
                    
                    // INFO

                    $(".menuheader").after('<div id="infoBlock"><ul></ul></div>');
                    var sRestuarentPhone = result.sRestuarentPhone;
                    var sRestuarentPhoneFormat = sRestuarentPhone.substring(0, 2)+' '+sRestuarentPhone.substring(2, 4)+' '+sRestuarentPhone.substring(4, 6)+' '+sRestuarentPhone.substring(6, 8);
                    $("#infoBlock ul").append('<li class="dishPoint PhoneNumber"><img src="img/call up.png"><a href="tel:'+sRestuarentPhone+'" rel="external">'+sRestuarentPhoneFormat+'</a></li>');
                    $("#infoBlock ul").append('<li class="dishPoint" id="OpeningHours"></li>');
                    
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
                            $("#infoBlock ul").append('<li class="dishPoint">'+Info.sMenucardInfoHeadline+'<p>'+Info.sMenucardInfoParagraph+'</p></li>');
                    }); 
                    
                    $("#infoBlock ul").append('<li class="dishPoint button" onclick="InfoToggle();"><img src="img/arrowUp.png"></li>');

                    // STAMPS
                    
                    //Get Stamps for the user
                    var iStamps = localStorage.getItem(result.iMenucardSerialNumber+".stamps");
                    if(iStamps === null){iStamps = 0;} 
                    $("#infoBlock").after('<div id="stampBlock"><a id="makeStampPageBtn" onclick="makeStampPage(\''+result.iMenucardSerialNumber+'\','+iStamps+','+result.oStampcard.iStampcardMaxStamps+');"><h3>Stempler</h3> <div id="stampTotal" class="stampCircleIcon"><p>'+iStamps+'</p></div></a></div>');

                    // MESSAGES

                    $("#stampBlock").after('<div id="messageBlock" class="messageBlock"></div>');
                    $("#messageBlock").empty();

                          if(typeof result.oMessages[0] != "undefined") {
                                var sMessageHeadline = result.oMessages[0].headline;
                                var sMessageBodyText = result.oMessages[0].bodytext;
                                var sMessageImage = result.oMessages[0].image;
                                var sMessageDate = result.oMessages[0].date;
                                var sMessageDateCut = sMessageDate.substring(0,10);
                                if(sMessageImage === undefined) {
                                    $("#messageBlock").append("<div><p>"+sMessageDateCut+"</p><h1>"+sMessageHeadline+"</h1><h2>"+sMessageBodyText+"</h2></div>");
                                }else {                              
                                  $("#messageBlock").append("<div><p>"+sMessageDateCut+"</p><img width='100%' height='auto' src='data:image/x-icon;base64,"+sMessageImage+"'><h1>"+sMessageHeadline+"</h1><h2>"+sMessageBodyText+"</h2></div>");
                                  
                                }
                                //Check if message has been seen
                                var PrevMessageDate = localStorage.getItem(result.iMenucardSerialNumber+".message");
                                if( sMessageDate == PrevMessageDate){
                                    $(".messageBlock").removeClass("out");
                                }
                                else {
                                  $(".messageBlock").addClass("out");
                                  localStorage.setItem(result.iMenucardSerialNumber+".message", sMessageDate);
                                }
                          }



                    // MENU

                    $("#menu").append("<div id='menuBlock'></div>");
                    $.each(result.aMenucardCategory, function(key,value){
//                              alert('liste index: '+key);
                              var category = {
                                  sMenucardCategoryName: value.sMenucardCategoryName,
                                  sMenucardCategoryDescription: value.sMenucardCategoryDescription,
//                                  iMenucardCategoryIdHashed: value.iMenucardCategoryIdHashed,
                                  items:[]
                              };
                             $("#menuBlock").append("<ul class='MenucardCategoryGroup"+key+"'></ul>");
                             $(".MenucardCategoryGroup"+key).append('<li class="dishHeadline" onclick="MenucardItemsToggle('+key+');">'+category.sMenucardCategoryName+'<p>'+category.sMenucardCategoryDescription+'</p><img src="img/down_arrow.svg"></li>');
                             
                             if(typeof result['aMenucardCategoryItems'+key] !== "undefined") {
                             
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
                                  
                                  if( item.iMenucardItemPrice != ''){ 
                                    var Price = '<h2>'+item.iMenucardItemPrice+',-</h2>';
                                  }
                                  else{
                                    var Price = '';
                                  }

                                  $(".MenucardCategoryGroup"+key).append('<li class="dishPoint"><h1>'+item.sMenucardItemName+'</h1>'+Price+'<p>'+item.sMenucardItemDescription+'</p></li>');
                              });
                          }

                          
                          });                     
                 
//                    $(".spinner div").css('animation-name', 'none');
//                    $(".spinner div").css('width', '100%');
//                    $(".spinner").remove();
//                    
//                    $.mobile.changePage("#menu", {
//                        transition: "slide"
//                    });
//                    var sRestuarentName = result.sRestuarentName; 
//                    var sRestuarentAddress = result.sRestuarentAddress;
//                    $("#menu").append('<div class="menuheader"><h1>'+sRestuarentName+'</h1><img class="img_left" src="img/message.png" onclick="MessageToggle();"><p>'+sRestuarentAddress+'</p><p>'+result.iRestuarentInfoZipcode+', '+result.sRestuarentInfoCity+'</p><img class="img_right" onclick="InfoToggle();" src="img/info.png"></div>');
//                    $("#menu").append("<ul style='margin: 0 auto -20px auto;'></ul>");
//                    $("#menu ul").append('<div id="messageBlock" onclick="MessageToggle();"><ul class="messageBlock"></ul></div>');
//                    $("#messageBlock").after('<div id="infoBlock"></div>');
//                    $("#infoBlock").append('<li class="dishPoint"><h1>info</h1></li>');
//                    var sRestuarentPhone = result.sRestuarentPhone;
//                    var sRestuarentPhoneFormat = sRestuarentPhone.substring(0, 2)+' '+sRestuarentPhone.substring(2, 4)+' '+sRestuarentPhone.substring(4, 6)+' '+sRestuarentPhone.substring(6, 8);
//                    $("#infoBlock").append('<li class="dishPoint PhoneNumber"><img src="img/call up.png"><a href="tel:'+sRestuarentPhone+'" rel="external">'+sRestuarentPhoneFormat+'</a></li>');
//                    $("#infoBlock").append('<li class="dishPoint" id="OpeningHours"></li>');
//                    
//                    $.each(result.aMenucardOpeningHours, function(key,value){
//                            var OpeningHours = {
//                                         sDayName: value.sDayName,
//                                         iTimeFrom: value.iTimeFrom,
//                                         iTimeTo: value.iTimeTo,
//                                         iClosed: value.iClosed
//                                     };
//                            if(OpeningHours.iClosed === '0'){
//                                $("#OpeningHours").append('<h1>'+OpeningHours.sDayName+'</h1><h2>'+OpeningHours.iTimeFrom+' - '+OpeningHours.iTimeTo+'</h2><br>');
//                            }else if(OpeningHours.iClosed === '1'){                              
//                               $("#OpeningHours").append('<h1>'+OpeningHours.sDayName+'</h1><h2>Lukket</h2><br>');
//                            }
//                            }); 
//                    $.each(result.aMenucardInfo, function(key,value){
//                            var Info = {
//                                         sMenucardInfoHeadline: value.sMenucardInfoHeadline,
//                                         sMenucardInfoParagraph: value.sMenucardInfoParagraph
//                                     };
//                            $("#infoBlock").append('<li li class="dishPoint">'+Info.sMenucardInfoHeadline+'<p>'+Info.sMenucardInfoParagraph+'</p></li>');
//                    }); 
//                    
//                    $("#infoBlock").append('<li class="dishPoint button" onclick="InfoToggle();"><img src="img/arrowUp.png"></li><br>');
//
//                    $.each(result.aMenucardCategory, function(key,value){
////                              alert('liste index: '+key);
//                              var category = {
//                                  sMenucardCategoryName: value.sMenucardCategoryName,
//                                  sMenucardCategoryDescription: value.sMenucardCategoryDescription,
////                                  iMenucardCategoryIdHashed: value.iMenucardCategoryIdHashed,
//                                  items:[]
//                              };
//                             $("#menu").append("<ul class='MenucardCategoryGroup"+key+"'></ul>");
//                             $(".MenucardCategoryGroup"+key).append('<li class="dishHeadline" onclick="MenucardItemsToggle('+key+');">'+category.sMenucardCategoryName+'<p>'+category.sMenucardCategoryDescription+'</p><img src="img/down_arrow.svg"></li>');
//                             
//                             if(typeof result['aMenucardCategoryItems'+key] !== "undefined") {
//                             
//                              $.each(result['aMenucardCategoryItems'+key].sMenucardItemName, function(keyItem,value){
//
//                                  var sMenucardItemName = value;
//                                  var sMenucardItemDescription = result['aMenucardCategoryItems'+key].sMenucardItemDescription[keyItem];
//                                  var iMenucardItemPrice = result['aMenucardCategoryItems'+key].iMenucardItemPrice[keyItem];
////                                  var iMenucardItemIdHashed = result['aMenucardCategoryItems'+key].iMenucardItemIdHashed[keyItem];
////                                  var iMenucardItemPlaceInList = result['aMenucardCategoryItems'+key].iMenucardItemPlaceInList[keyItem];
//                                  
//                                  var item = {
//                                      sMenucardItemName: sMenucardItemName,
//                                      sMenucardItemDescription: sMenucardItemDescription,
////                                      sMenucardItemNumber: sMenucardItemNumber,
//                                      iMenucardItemPrice: iMenucardItemPrice
////                                      iMenucardItemIdHashed: iMenucardItemIdHashed,
////                                      iMenucardItemPlaceInList: iMenucardItemPlaceInList
//                                  };
//                                  //Append the item to the items in the category obj
////                                  category.items.push(item);
//
//                                  if( item.iMenucardItemPrice != ''){ 
//                                    var Price = '<h2>'+item.iMenucardItemPrice+',-</h2>';
//                                  }
//                                  else{
//                                    var Price = '';
//                                  }
//                                  $(".MenucardCategoryGroup"+key).append('<li class="dishPoint"><h1>'+item.sMenucardItemName+'</h1>'+Price+'<p>'+item.sMenucardItemDescription+'</p></li>');
//                              });
//
//                              }
//                          
//                          });
//                            
//                            
//                          $("#messageBlock ul").empty();
//                          if(typeof result.oMessages[0] != "undefined") {
//                                var sMessageHeadline = result.oMessages[0].headline;
//                                var sMessageBodyText = result.oMessages[0].bodytext;
//                                var sMessageImage = result.oMessages[0].image;
//                                var sMessageDate = result.oMessages[0].date;
//                                var sMessageDateCut = sMessageDate.substring(0,10);
//                                if(sMessageImage === undefined) {
//                                    $("#messageBlock ul").append("<li><p>"+sMessageDateCut+"</p><h1>"+sMessageHeadline+"</h1><h2>"+sMessageBodyText+"</h2></li>");
//                                }else {                              
//                                  $("#messageBlock ul").append("<li><p>"+sMessageDateCut+"</p><img width='200' height='200' src='data:image/x-icon;base64,"+sMessageImage+"'><h1>"+sMessageHeadline+"</h1><h2>"+sMessageBodyText+"</h2></li>");
//                                  
//                                }
//                                
//                                var PrevMessageDate = localStorage.getItem(result.iMenucardSerialNumber+".message");
//                                // tjek if massege is Seen
//                                if( sMessageDate == PrevMessageDate){
//                                    $(".messageBlock").removeClass("out");
//                                }
//                                else {
//                                  $(".messageBlock").addClass("out");
//                                  localStorage.setItem(result.iMenucardSerialNumber+".message", sMessageDate);
//                                }
//                          }
                          
                          
                          SaveUserFavorites(result.iMenucardSerialNumber,sRestuarentName,sRestuarentAddress);                      
                          
                          //$("#favoriteWrapper").append('<div class="favoriteItemWrapper"><a id="'+iMenucardSerialNumber+'" href="#" data-transition="slide" class="ui-btn" onclick="GetMenucardWithSerialNumber(\''+iMenucardSerialNumber+'\');">'+sRestuarentName+'<p>'+sRestuarentAddress+'</p></a></div>');
                          $(".ui-btn").on( "swiperight", FavoritDelete );
                                
                }
                else {
                        $(".spinner div").css('animation-name', 'none');
                        $(".spinner div").css('width', '100%');
                        $(".spinner").remove();
                        $('#FindCafe').before('<div class="popMgs">Denne café er endnu ikke medlem af My Local Café. Følg med og like os på facebook. Der kommer hele tiden nye Caféer til.</div>');
                        $('.popMgs').hide().fadeIn().delay(4800).fadeOut(500,function(){ $(this).remove(); });        
                }
            });
}

function SaveUserFavorites(iMenucardSerialNumber,sRestuarentName,sRestuarentAddress) {
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
         $("#favoriteWrapper").append("<h6>FAVORITTER</h6>");
         $("#favoriteWrapper").append('<div class="favoriteItemWrapper"><a id="'+iMenucardSerialNumber+'" href="#" data-transition="slide" class="ui-btn" onclick="GetMenucardWithSerialNumber(\''+iMenucardSerialNumber+'\');">'+sRestuarentName+'<p>'+sRestuarentAddress+'</p></a></div>');


      }
                          
      // make favorit block
      if($("#favoriteWrapper").html() === ''){
          $("#favoriteWrapper").append("<h6>FAVORITTER</h6>");
      } 
}

function GetMenucardWithSerialNumber(sSerialNumber) {

    CheckInternetConnection(); 
    $("#menu").empty();
    
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

                    // HEAD

                    var sRestuarentName = result.sRestuarentName; 
                    var sRestuarentAddress = result.sRestuarentAddress;

                    $("#menu").append('<div class="menuheader"><a href="#home" data-transition="slide" data-direction="reverse" id="backButtonL" onclick="ClearSearchInput();"><img src="img/backWhite.png"></a><h1>'+sRestuarentName+'</h1><p>'+sRestuarentAddress+'</p><p>'+result.iRestuarentInfoZipcode+', '+result.sRestuarentInfoCity+'</p><img class="img_right" onclick="InfoToggle();" src="img/info.png"></div>');
                    
                    $("#menu").append("<ul style='margin: 0 auto -20px auto;'></ul>");
                    
                    // INFO

                    $(".menuheader").after('<div id="infoBlock"><ul></ul></div>');
                    var sRestuarentPhone = result.sRestuarentPhone;
                    var sRestuarentPhoneFormat = sRestuarentPhone.substring(0, 2)+' '+sRestuarentPhone.substring(2, 4)+' '+sRestuarentPhone.substring(4, 6)+' '+sRestuarentPhone.substring(6, 8);
                    $("#infoBlock ul").append('<li class="dishPoint PhoneNumber"><img src="img/call up.png"><a href="tel:'+sRestuarentPhone+'" rel="external">'+sRestuarentPhoneFormat+'</a></li>');
                    $("#infoBlock ul").append('<li class="dishPoint" id="OpeningHours"></li>');
                    
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
                            $("#infoBlock ul").append('<li class="dishPoint">'+Info.sMenucardInfoHeadline+'<p>'+Info.sMenucardInfoParagraph+'</p></li>');
                    }); 
                    
                    $("#infoBlock ul").append('<li class="dishPoint button" onclick="InfoToggle();"><img src="img/arrowUp.png"></li>');

                    // STAMPS
                    //Get user stamps
                    var iStamps = localStorage.getItem(sSerialNumberCaps+".stamps");
                    //Calculate stamps left
                    var iFreeItems = Math.floor(iStamps / result.oStampcard.iStampcardMaxStamps);
                    var iStampsLeft = iStamps - ( iFreeItems * result.oStampcard.iStampcardMaxStamps); 
                    if(iStampsLeft === null){iStampsLeft = 0;} 
                    $("#infoBlock").after('<div id="stampBlock"><a id="makeStampPageBtn" onclick="makeStampPage(\''+sSerialNumberCaps+'\','+iStamps+','+result.oStampcard.iStampcardMaxStamps+');"><h3>Stempler</h3> <div id="stampTotal" class="stampCircleIcon"><p>'+iStampsLeft+'</p></div></a></div>');

                    // MESSAGES

                    $("#stampBlock").after('<div id="messageBlock" class="messageBlock"></div>');
                    $("#messageBlock").empty();

                          if(typeof result.oMessages[0] != "undefined") {
                                var sMessageHeadline = result.oMessages[0].headline;
                                var sMessageBodyText = result.oMessages[0].bodytext;
                                var sMessageImage = result.oMessages[0].image;
                                var sMessageDate = result.oMessages[0].date;
                                var sMessageDateCut = sMessageDate.substring(0,10);
                                if(sMessageImage === undefined) {
                                    $("#messageBlock").append("<div><p>"+sMessageDateCut+"</p><h1>"+sMessageHeadline+"</h1><h2>"+sMessageBodyText+"</h2></div>");
                                }else {                              
                                  $("#messageBlock").append("<div><p>"+sMessageDateCut+"</p><img width='100%' height='auto' src='data:image/x-icon;base64,"+sMessageImage+"'><h1>"+sMessageHeadline+"</h1><h2>"+sMessageBodyText+"</h2></div>");
                                  
                                }
                                //Check if message has been seen
                                var PrevMessageDate = localStorage.getItem(sSerialNumberCaps+".message");                               
                                if( sMessageDate == PrevMessageDate){
                                    $(".messageBlock").removeClass("out");
                                }
                                else {
                                  $(".messageBlock").addClass("out");
                                  localStorage.setItem(sSerialNumberCaps+".message", sMessageDate);
                                }
                          }



                    // MENU

                    $("#menu").append("<div id='menuBlock'><h3>Menu</h3></div>");
                    $.each(result.aMenucardCategory, function(key,value){
//                              alert('liste index: '+key);
                              var category = {
                                  sMenucardCategoryName: value.sMenucardCategoryName,
                                  sMenucardCategoryDescription: value.sMenucardCategoryDescription,
//                                  iMenucardCategoryIdHashed: value.iMenucardCategoryIdHashed,
                                  items:[]
                              };
                             $("#menuBlock").append("<ul class='MenucardCategoryGroup"+key+"'></ul>");
                             $(".MenucardCategoryGroup"+key).append('<li class="dishHeadline" onclick="MenucardItemsToggle('+key+');">'+category.sMenucardCategoryName+'<p>'+category.sMenucardCategoryDescription+'</p><img src="img/down_arrow.svg"></li>');
                             
                             if(typeof result['aMenucardCategoryItems'+key] !== "undefined") {
                             
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
                                  
                                  if( item.iMenucardItemPrice != ''){ 
                                    var Price = '<h2>'+item.iMenucardItemPrice+',-</h2>';
                                  }
                                  else{
                                    var Price = '';
                                  }

                                  $(".MenucardCategoryGroup"+key).append('<li class="dishPoint"><h1>'+item.sMenucardItemName+'</h1>'+Price+'<p>'+item.sMenucardItemDescription+'</p></li>');
                              });
                          }

                          
                          });                                                   
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
    
function makeStampPage(iMenucardSerialNumber,iUserStamps,MaxStamps){
  var iUserStamps = iUserStamps;
  var iStampsForFree = MaxStamps;
  
  var iFreeItems = Math.floor(iUserStamps / iStampsForFree);
  var iStampsLeft = iUserStamps - ( iFreeItems * iStampsForFree);


  $("#stampBlock").velocity("transition.slideUpBigOut",400);
  $("#messageBlock").velocity("transition.slideDownBigOut",600);
  $("#menuBlock").velocity("transition.slideDownBigOut", 400, function(){
  
  $("#stampBlock").after("<div id='stampPage'></div>");
      $("#stampPage").before("<a class='backStampBtn' onclick='removeStampPage();'>tilbage</a>");
      $("#stampPage a").hide().velocity("transition.bounceDownIn",400);
        // $("#stampPage").append("<h3>Stempler ("+iUserStamps+")</h3>")
        
      $("#stampPage").append("<div class='StampsForNext' onclick='GetStamp(\""+iMenucardSerialNumber+"\",1);'><div class='stampCircle'><p>+</p></div></div>");
      $(".stampCircle").hide().velocity("transition.expandIn", 200, function(){
          $(".stampCircle").prepend("<h3>Stempler</h3>");
          
          
          makeStampCounter(iStampsLeft,iStampsForFree);

          $("#stampPage").append("<h4>For hver "+iStampsForFree+". stemple, får du en gratis Kaffe.</h4>");
          $("#stampPage").append("<h4 class='iFreeItemCounter'>Du har nu "+iFreeItems+" gratis:</h4>");
          $("#stampPage").append("<div id='FreeItemsBlock'></div>");
          for (var i = 1; i <= iFreeItems; i++){
              $("#FreeItemsBlock").append("<div class='stampCircleIcon black' onclick='ChooseStampCircle(this);'><p>"+i+"</p></div>");
          } 

          $("#FreeItemsBlock .stampCircleIcon").hide().velocity("transition.slideUpIn", { display:"inline-block", duration: 800 });
          $("#stampPage").append("<a class='useStampsBtn' onclick='GetStamp(\""+iMenucardSerialNumber+"\",2,"+MaxStamps+");'>Brug</a>");
      });
  });
}

function ChooseStampCircle(elem) {
    
    $(elem).toggleClass("choosenstampicon");
    
    //Hide show useStampsBtn
    if($('.choosenstampicon').length >= 1){
        $('.useStampsBtn').show();
    }else{
       $('.useStampsBtn').hide(); 
    }
    
}

function removeStampPage(){
  $("#stampPage").remove();
  $(".backStampBtn").remove();
  $("#stampBlock").velocity("transition.slideDownBigIn",400);
  $("#messageBlock").velocity("transition.slideUpBigIn",600);
  $("#menuBlock").velocity("transition.slideUpBigIn", 400);
}

function makeStampCounter(iStampsLeft,iStampsForFree){
    $("#stampsCounterText").remove();
    $(".stampCircle h3").after("<h3 id='stampsCounterText'>"+iStampsLeft+"/"+iStampsForFree+"</h3>");
    $(".stampCircle h3").hide().velocity("transition.slideDownIn", { stagger: 100, duration: 150 });
    $(".stampCircle").append("<div class='stampCircleFill'></div>");
    var height = parseInt($(".stampCircle").outerHeight());
    var stampIntivals = height / iStampsForFree;
    var fillHeigth = stampIntivals * iStampsLeft;
    $(".stampCircleFill").css("height", fillHeigth);
    $(".stampCircleFill").hide().velocity("transition.slideUpBigIn", 400 );
}

function GetStamp(iMenucardSerialNumber,sFunction,iMaxStamp){
  if(sFunction === 1){
        //Get stamp
        $(".backGetStampBtn").remove();
        $("#getStampPage").remove();
        $("#stampPage").velocity("transition.shrinkOut", 400, function(){
          $(".backStampBtn").hide();
          $("#stampPage").hide();
          $("#stampBlock").after("<div id='getStampPage'></div>");
          $("#getStampPage").before("<a class='backGetStampBtn' onclick='removeGetStampsPage();'>tilbage</a>");
          $("#getStampPage").append("<p>Antal stempler:</p>");
          $("#getStampPage").append("<a onclick='numOfStampsChange(-1);'>-</a><h1 id='numOfStamps'>1</h1><a onclick='numOfStampsChange(1);'>+</a>");
          $("#getStampPage").append("<div class='inputGetStampwrapper'><div id='inputGetStamp1' class='inputGetStamp'></div><div id='inputGetStamp2' class='inputGetStamp'></div><div id='inputGetStamp3' class='inputGetStamp'></div><div id='inputGetStamp4' class='inputGetStamp'></div></div>");
          makeKeypad('getStampPage',iMenucardSerialNumber,1);    
          $("#getStampPage").hide().velocity("transition.slideUpBigIn", 200);   
    });
  }else if(sFunction === 2){
        //Redeme stamp
        $(".backGetStampBtn").remove();
        $("#getStampPage").remove();
        $("#stampPage").velocity("transition.shrinkOut", 400, function(){
          $(".backStampBtn").hide();
          $("#stampPage").hide();
          $("#stampBlock").after("<div id='getStampPage'></div>");
          $("#getStampPage").before("<a class='backGetStampBtn' onclick='removeGetStampsPage();'>tilbage</a>");
          $("#getStampPage").append("<p>Indløs stempler</p>");
          //Get number of freeitems
          var iNumberOfFreeItems = $('.choosenstampicon').length;
          //Convert iNumberOfFreeItems to stamps
          var iNumberOfStamps = iNumberOfFreeItems * iMaxStamp;
          $("#getStampPage").append("<a onclick=''>-</a><h1 id='numOfStamps'>"+iNumberOfStamps+"</h1><a onclick=''>-</a>");
          $("#getStampPage").append("<div class='inputGetStampwrapper'><div id='inputGetStamp1' class='inputGetStamp'></div><div id='inputGetStamp2' class='inputGetStamp'></div><div id='inputGetStamp3' class='inputGetStamp'></div><div id='inputGetStamp4' class='inputGetStamp'></div></div>");
          makeKeypad('getStampPage',iMenucardSerialNumber,2,iMaxStamp);    
          $("#getStampPage").hide().velocity("transition.slideUpBigIn", 200);   
    }); 
  }
} 

function numOfStampsChange(num){
  var numbersOfStamps = parseInt( $("#numOfStamps").text() );
  var numbersOfStamps = numbersOfStamps + num;
  if( numbersOfStamps <= 0 ){ numbersOfStamps = 1; }
  $("#numOfStamps").text(numbersOfStamps);
}
function makeKeypad(id,iMenucardSerialNumber,sFunction,iMaxStamp){
    if(sFunction === 1){
        //Get stamp
        $("#"+id).append("<div class='keypad'><div>");
        for( var i = 1; i <= 9; i++){
            $("#"+id+" .keypad").append("<a onclick='btnKeypad("+i+");'>"+i+"</a>");
        }        
        $("#"+id+" .keypad").append("<a onclick='btnKeypad(-1);'><-</a>");
        $("#"+id+" .keypad").append("<a onclick='btnKeypad(0);'>0</a>");
        $("#"+id+" .keypad").append("<a onclick='KeypadOk(\""+iMenucardSerialNumber+"\");'>ok</a>");
      }else if(sFunction === 2){
          //Redeme stamp
          $("#"+id).append("<div class='keypad'><div>");
          for( var i = 1; i <= 9; i++){
              $("#"+id+" .keypad").append("<a onclick='btnKeypad("+i+");'>"+i+"</a>");
          }
          $("#"+id+" .keypad").append("<a onclick='btnKeypad(-1);'><-</a>");
          $("#"+id+" .keypad").append("<a onclick='btnKeypad(0);'>0</a>");
          $("#"+id+" .keypad").append("<a onclick='UseStamp(\""+iMenucardSerialNumber+"\","+iMaxStamp+");'>ok</a>");
      }
}
function btnKeypad(num){
  var i = 1;
  if( num < 0 ){
     for( var j = 1; j <= 4; j++ ){
        var a = $("#inputGetStamp"+j+" span").length;
        if($("#inputGetStamp"+j+" span").length == 1){ var i = j; }
      }
      $("#inputGetStamp"+i+" span").remove();
  }
  else{      
      for( var j = 1; j <= 4; j++ ){
        var a = $("#inputGetStamp"+j+" span").length;
        if($("#inputGetStamp"+j+" span").length == 1){ var i = j+1; }
      }
      $("#inputGetStamp"+i).append("<span>"+num+"</span>");
  }
}




/*
 @UseStamp()
    -Description: Redeme x number of stamps
 */
function UseStamp(iMenucardSerialNumber,iMaxStamp) {
    
    //http://localhost/MyLocalMenu/API/api.php?sFunction=RedemeStampcard&iMenucardSerialNumber=AA0000&sCustomerId=abc123&sRedemeCode=1234
    var numbersOfStamps = $("#numOfStamps").text();
    if ($("#inputGetStamp4 span").length === 1){
    
        var sCustomerId = localStorage.getItem("sCustomerId");
        var Stampcode = $('#inputGetStamp1 span').html()+''+$('#inputGetStamp2 span').html()+''+$('#inputGetStamp3 span').html()+''+$('#inputGetStamp4 span').html();
        Stampcode = parseInt(Stampcode);
        
        //Get number of choosen freeitems to redeme    
        var iNumberOfFreeItems = $('.choosenstampicon').length;
        //Convert iNumberOfFreeItems to stamps
        var iNumberOfStamps = iNumberOfFreeItems * iMaxStamp;
        
        
        $.ajax({
          type: "GET",
          url: sAPIURL,
          dataType: "jSON",
          data: {sFunction:"RedemeStampcard",sCustomerId:sCustomerId,sRedemeCode:Stampcode,iMenucardSerialNumber:iMenucardSerialNumber,iNumberOfStamps:iNumberOfStamps}
         }).done(function(result){
             if(result.result === 'true'){
                 
                 //remove use free item
                 $('.choosenstampicon').remove();
                 
                 // opdater antal stempler i localStorage
                 var stamps = localStorage.getItem(iMenucardSerialNumber+".stamps");
                 var stamps = parseInt(stamps) - parseInt(iNumberOfStamps);
                 localStorage.setItem(iMenucardSerialNumber+".stamps",stamps);
                 
                 // animation
                 $("#getStampPage").velocity("transition.slideDownBigOut", 200, function() {

                         $(".succesAlert").remove();
                         $(".backGetStampBtn").remove();
                         $("#getStampPage").remove();
                         $(".backStampBtn").show();
                         $("#stampPage").velocity("transition.expandIn", 400, function(){
                             var stampsCounterText = $("#stampsCounterText").text().split('/');;
                             //var iStampsLeft = parseInt(stampsCounterText[0]) + stamps;
                             var iStampsForFree = parseInt(stampsCounterText[1]);
                             //Count number of divs to get the number of old free items
                             var iFreeItems = $("#FreeItemsBlock > div").length;

                             //Update text for free items
                             $(".iFreeItemCounter").html("Du har nu "+iFreeItems+" gratis:");

                             //Change onlick event of btn
                             $('#makeStampPageBtn').attr('onclick','makeStampPage(\''+iMenucardSerialNumber+'\','+stamps+','+iStampsForFree+')');

                        });
                 });
                 
             }else{
                 alert('Forkert kodeord!');
             }
         });

        } else {
            for( var i = 1; i <= 4; i++){
                if($("#inputGetStamp"+i+" span").length === 0){
                    $("#inputGetStamp"+i).velocity("callout.tada", 400 );
                }
            }   
        }
}

/*
 @KeypadOk()
    -Description: Get stamp
 */
function KeypadOk(iMenucardSerialNumber){
  var numbersOfStamps = $("#numOfStamps").text();
  if ($("#inputGetStamp4 span").length == 1){
      
      var Stampcode = $('#inputGetStamp1 span').html()+''+$('#inputGetStamp2 span').html()+''+$('#inputGetStamp3 span').html()+''+$('#inputGetStamp4 span').html();
      Stampcode = parseInt(Stampcode);
      var sCustomerId = localStorage.getItem("sCustomerId");
      
      $.ajax({
              type: "GET",
              url: sAPIURL,
              dataType: "jSON",
              data: {sFunction:"GetStamp",sCustomerId:sCustomerId,Stampcode:Stampcode,iMenucardSerialNumber:iMenucardSerialNumber,iNumberOfStamps:numbersOfStamps}
             }).done(function(result){
                   
                    if(result.result === 'true') {
                        
                        // opdater antal stempler i localStorage
                        var stamps = localStorage.getItem(iMenucardSerialNumber+".stamps");
                        var stamps = parseInt(stamps) + parseInt(numbersOfStamps);
                        localStorage.setItem(iMenucardSerialNumber+".stamps",stamps);

                        // animation
                         $("#getStampPage").velocity("transition.slideDownBigOut", 200, function() {
                                 
                                 $(".succesAlert").remove();
                                 $(".backGetStampBtn").remove();
                                 $("#getStampPage").remove();
                                 $(".backStampBtn").show();
                                 $("#stampPage").velocity("transition.expandIn", 400, function(){
                                     var stampsCounterText = $("#stampsCounterText").text().split('/');;
                                     var iStampsLeft = parseInt(stampsCounterText[0]) + stamps;
                                     var iStampsForFree = parseInt(stampsCounterText[1]);
                                     
                                     //Set free items
                                     var iStampsCalc = parseInt(stampsCounterText[0]) + parseInt(numbersOfStamps);
                                     var iFreeItems = Math.floor(iStampsCalc / iStampsForFree);

                                     //Count number of divs to get the number of old free items
                                     var oldFreeItems = $("#FreeItemsBlock > div").length;

                                     //Calcualte total free items
                                     iFreeItems = parseInt(oldFreeItems) + parseInt(iFreeItems);                                     


                                     //Update text for free items

                                     $("#stampPage h4:nth-child(3)").html("Du har nu "+iFreeItems+" gratis:");
                                     //Clear old free items
                                     $("#FreeItemsBlock").html("");

                                     $(".iFreeItemCounter").html("Du har nu "+iFreeItems+" gratis:");
                                     //Clear old free items
                                     $("#FreeItemsBlock").html("");

                                     //Calculate stamps left
                                     var iStampsLeft = stamps - ( iFreeItems * iStampsForFree);
                                     
                                     // animation filled circleCounter
                                     var newChecker = parseInt(numbersOfStamps)+parseInt(stampsCounterText[0]);
                                    if( newChecker >= iStampsForFree ){          
                                        var counterFree =  Math.floor( newChecker / iStampsForFree );
                                        
                                      makeStampCounter(iStampsForFree,iStampsForFree);
                                      setTimeout(function(){
                                          $(".stampCircle").append("<div class='stampCircleFillNew'><h1>tillykke</h1><h2>"+counterFree+"</h2><h1>gratis</h1></div>");
                                          $("body").append("<div id='bgFade' class='dim color'></div>");
                                          $(".stampCircle").velocity("callout.pulse", 400);
                                          $("#bgFade").hide().velocity("transition.shrinkIn",100, function(){
                                            $("#bgFade").velocity("transition.shrinkOut",100, function(){
                                                $("#bgFade").remove();
                                            });
                                          });
                                          $(".stampCircleFillNew").velocity("callout.pulse", 400, function(){
                                            $(".stampCircleFillNew").velocity("transition.expandOut",{ delay: 200 }, 400);                                        
                                          });
                                          makeStampCounter(0,iStampsForFree);
                                      }, 200);

                                        
                                        var restStamps = newChecker - ( iStampsForFree * counterFree );
                                        setTimeout(function(){makeStampCounter(restStamps,iStampsForFree);},1600);
                                        $("#stampTotal p").text(restStamps);

                                        //Display all the free items
                                         for (var i = 1; i < iFreeItems; i++){
                                              $("#FreeItemsBlock").append("<div class='stampCircleIcon black' onclick='ChooseStampCircle(this);'><p>"+i+"</p></div>");
                                         } 

                                        setTimeout(function(){
                                           $("#FreeItemsBlock").append("<div id='getNewfreeAni' class='stampCircleIcon black' onclick='ChooseStampCircle(this);'><p>"+i+"</p></div>");
                                           // New Free item Animation
                                           if( iFreeItems > parseInt(oldFreeItems) ) {                                        
                                              $("#getNewfreeAni").velocity("transition.shrinkIn", { display:"inline-block", stagger: 100, duration: 900 });
                                           }     
                                        }, 600);                                                                                                            
                                    } 
                                    else{
                                        $("#stampTotal p").text(iStampsLeft);
                                        makeStampCounter(iStampsLeft,iStampsForFree);
                                    }
                                     //Change onlick event of btn
                                     $('#makeStampPageBtn').attr('onclick','makeStampPage(\''+iMenucardSerialNumber+'\','+stamps+','+iStampsForFree+')');
                                 
                                });
                         }); 
                     
                    }else{
                        alert('Forkert kodeord!');   // lav!
                    }
       });
  } else{
   for ( var i = 1; i <= 4; i++){
          if($("#inputGetStamp"+i+" span").length == 0){
                $("#inputGetStamp"+i).velocity("callout.tada", 400 );
          }
      }   
  }
}

function markStampsForUse() {

}

function removeGetStampsPage(){  
  $("#getStampPage").velocity("transition.slideDownBigOut", 200, function() {
      $(".backGetStampBtn").remove();
      $("#getStampPage").remove();
      $(".backStampBtn").show();
      $("#stampPage").velocity("transition.shrinkIn", 400);
  });
  
}

function AppIntro() {

  var introHead = "<h3>Velkommen til</h3><h1>MyLocal<span>Café</span></h1>";
  var introDec = "<h2>Her kan du følge dine favorit caféer.</h2><h2>Du kan se info om deres sted, se deres menukort, samt få aktuelle tilbud og beskeder direkte.</h2><h2>Søg blot på dine lokale favorit caféer i søgefeltet for at komme i gang!</h2>";

  var introDelBtn = "<a class='btn' onclick='ClearAppIntro();'>Til appen</a>"

  $('body').append("<div class='introScreen'><img src='img/logo_4.png'><br>"+introHead+introDec+introDelBtn+"</div>");

}

function ClearAppIntro() {
  $(".introScreen").remove();
  $("#FindCafe").focus();

  localStorage.setItem("introScreen", "seen");
}