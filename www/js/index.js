window.onload = function(){
    
    CheckInternetConnection();
    
    getMessagesAndStamps();
    makeFavorits();
    
    $(".ui-btn").on( "swiperight", FavoritDelete );
    
    // se hvad der er i localStorage 
    // localStorage.clear();
    console.log("ALLE I Localstoarge")
    for (var key in localStorage){   
        console.log(key)
    }
    var aUserFavorits = JSON.parse(localStorage.getItem("aUserFavorits"));
    var aUserFavorits = JSON.stringify(aUserFavorits);
    console.log("aUserFavorits = "+aUserFavorits);
}

function CheckInternetConnection() {
    var status = navigator.onLine;
    if( status == true ){
        $('#Offline').hide();
    }
    else {
        $('#Offline').show();
    }
}   

function InfoToggle(){
    $("#infoBlock .dishPoint").show();
    $("#infoBlock").slideToggle(400);
    var scrollTop = $("#menu").scrollTop();
    if( scrollTop >= 150 ){
        $("#menu").animate({ scrollTop: 0 }, 400);
    }
}

function MessageToggle() {
    $("#messageBlock").slideToggle(100);
    getMessages();
}

function MenucardItemsToggle(num) {
    $(".MenucardCategoryGroup"+num+" .dishPoint").slideToggle();
}

function FavoritDelete() {
    var widthBlock = $(this).width();
    var widthWindow = $( window ).width();
    var Id = $(this).attr("id");
    
    $(this).before('<div class="FavoritDeleteTjek" id="'+Id+'Wrapper"><a id="'+Id+'Del" href="#">Slet</a><p>.</p><a id="'+Id+'Cancel" href="#">Fortryd</a> </div>')
    
    
    $(this).css({
        width: widthBlock+"px"
    });
    $(this).animate({ marginLeft: widthWindow+"px"} , 200, function() {
        
        $("#"+Id+"Del").click( function(){
            $('#'+Id).parent().remove();
             
            var aUserFavorits = JSON.parse(localStorage.getItem("aUserFavorits"));
            var iUserFavorits = Object.keys(aUserFavorits).length;
            
            for(var i = 0; i < iUserFavorits; i++){
                if( aUserFavorits[i] == Id){
                    delete aUserFavorits[i]; 
                }
            }
            localStorage.setItem("aUserFavorits", JSON.stringify(aUserFavorits));
            
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

function makeFavorits () {
    $("#favoriteWrapper").empty();
    var aUserFavorits = JSON.parse(localStorage.getItem("aUserFavorits"));
    var iUserFavorits = Object.keys(aUserFavorits).length;
    
    if(iUserFavorits > 1){
        $("#favoriteWrapper").append("<h6>FAVORITTER</h6>");
        for(var i = 1; i < iUserFavorits; i++){

            var sCafeId = aUserFavorits[i];
            var sCafeName = localStorage.getItem(sCafeId+".fav.cafeName");
            var sCcafeAdress = localStorage.getItem(sCafeId+".fav.cafeAdress");

            $("#favoriteWrapper").append('<div class="favoriteItemWrapper"><a id="'+sCafeId+'" href="#" data-transition="slide" class="ui-btn" onclick="GetMenucardWithSerialNumber(\''+sCafeId+'\');">'+sCafeName+'<p>'+sCcafeAdress+'</p></a></div>');
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
       })
       menucards['sCustomerId'] = 'abc123';
       aData = menucards;
       //Workaround with encoding issue in IE8 and JSON.stringify
       for (var i in aData) {
           aData[i] = encodeURIComponent(aData[i]);
       }

       var sJSON = JSON.stringify(aData);
       
       //Make ajax call
   $.ajax({
        type: "GET",
        url: "http://xn--spjl-xoa.dk/MyLocalMenu/API/api.php",
        dataType: "json",
        data: {sFunction:"GetMessagesAndStampsApp",sJSONMenucards:sJSON}
       }).done(function(result) 
       {
           if(result.result === true){
               // tjek om beskeder fra app
               
               //opret nye new meggages
               $(".newMgs").remove();
               $.each(result.Menucards, function(index,val){

                        if (val.Messages[0].sMessageHeadline){
                            $("#"+index).append("<div class='newMgs'><p></p><div>")
                        }
                        // s?t antal stempler p? menukortet
                        var Stamps = val.iNumberOfStamps
                        localStorage.setItem(index+".stamps", Stamps);
                });           
            }
            else{
            }
       });
}

function findMenuCard() {
    $("#FindCafe").before('<div class="spinner"><div class="bar"></div></div>');
    var value = $("#FindCafe").val();
    GetMenucardWithSerialNumber(value);
}

function GetMenucardWithSerialNumber(sSerialNumber) {
//    var sSerialNumber = "AA0001";
    $("#menu").empty();
    addHeader(sSerialNumber);
    var sSerialNumberCaps = sSerialNumber.toUpperCase();
                          
    //Get data            
            $.ajax({
              type: "GET",
              url: "http://xn--spjl-xoa.dk/MyLocalMenu/API/api.php",
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
                    $("#menu").append('<div class="menuheader"><h1>'+sRestuarentName+'</h1><img class="img_left" src="img/message.png" onclick="MessageToggle();"><p>'+sRestuarentAddress+'</p><img class="img_right" onclick="InfoToggle();" src="img/info.png"></div>');
                    $("#menu").append("<ul></ul>");
                    $("#menu ul").append('<div id="messageBlock" onclick="MessageToggle();"><ul class="messageBlock"></ul></div>');

                    $("#messageBlock").hide();
//                    getMessages(sSerialNumberCaps);

                    $("#messageBlock").after('<div id="infoBlock"></div>');
                    $("#infoBlock").append('<li class="dishHeadline">info</li>');
                    var sRestuarentPhone = result.sRestuarentPhone;
                    var sRestuarentPhoneFormat = sRestuarentPhone.substring(0, 2)+' '+sRestuarentPhone.substring(2, 4)+' '+sRestuarentPhone.substring(4, 6)+' '+sRestuarentPhone.substring(6, 8);
                    $("#infoBlock").append('<li class="dishPoint PhoneNumber"><img src="img/call up.png"><a href="tel:'+sRestuarentPhone+'" rel="external">'+sRestuarentPhoneFormat+'</a></li>');
                    $("#infoBlock").append('<li class="dishPoint" id="OpeningHours"></li>');
                    
                    $.each(result.aMenucardOpeningHours, function(key,value){
                            var OpeningHours = {
                                         sDayName: value.sDayName,
                                         iTimeFrom: value.iTimeFrom,
                                         iTimeTo: value.iTimeTo
                                     };
                            $("#OpeningHours").append('<h1>'+OpeningHours.sDayName+'</h1><h2>'+OpeningHours.iTimeFrom+' - '+OpeningHours.iTimeTo+'</h2><br>');
                            }); 
                    $.each(result.aMenucardInfo, function(key,value){
                            var Info = {
                                         sMenucardInfoHeadline: value.sMenucardInfoHeadline,
                                         sMenucardInfoParagraph: value.sMenucardInfoParagraph
                                     };
                            $("#infoBlock").append('<li li class="dishPoint">'+Info.sMenucardInfoHeadline+'<p>'+Info.sMenucardInfoParagraph+'</p></li>');
                    }); 
                    
                    $("#infoBlock").append('<li class="dishPoint button" onclick="InfoToggle();"><img src="img/arrowUp.png"></li><br>');
                    $("#infoBlock").hide();

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
                            var stampsForFree = result.oStampcard.iStampcardMaxStamps;
                            for(var i=0; userStamps>0; i++){
                                if(userStamps >= stampsForFree){
                                    $(".StampCardWrapper").prepend("<div class='StampCard "+i+"'><h1>STEMPLEKORT</h1><h2>Du har 1 gratis kaffe</h2></div>");
                                    for(var j=1; j<=stampsForFree; j++){
                                    $(".StampCard."+i).append("<div class='Stamp Full'></div>");
                                    }
                                    $(".StampCard."+i).append('<a href="#HandInCard" onclick="makeHandinPage(\''+sSerialNumberCaps+'\',\''+stampsForFree+'\');" class="ui-btn">Indl?s kort</a>');
                                }
                                else {
                                    var rest = stampsForFree-userStamps;
                                    $(".StampCardWrapper").prepend("<div class='StampCard "+i+"'><h1>STEMPLEKORT</h1><h2>Du har "+userStamps+" stempler og mangler "+rest+" for at f? en gratis kop</h2></div>");
                                    for(var k=1; k<=userStamps; k++){
                                    $(".StampCard."+i).append("<div class='Stamp Full'></div>");
                                    }
                                    for(var l=userStamps; l<stampsForFree; l++){
                                    $(".StampCard."+i).append("<div class='Stamp'></div>");
                                    }
                                }
                                userStamps = userStamps - stampsForFree;
                            }
                            
                          // gemme lokalt
                            localStorage.setItem(sSerialNumberCaps+".fav.cafeName", sRestuarentName);
                            localStorage.setItem(sSerialNumberCaps+".fav.cafeAdress", sRestuarentAddress);
                          
                          // Opret Besked
                            $("#messageBlock").show();
                            $("#messageBlock ul").empty();
                            var sMessageHeadline = result.oMessages[0].headline;
                            var sMessageBodyText = result.oMessages[0].bodytext;
                            $("#messageBlock ul").append("<li><p>dato</p><h1>"+sMessageHeadline+"</h1><h2>"+sMessageBodyText+"</h2></li>");

                          
                          // Tjekker om Cafen er i favoritter - opretter den hvis ikke 
                          if( $("#"+sSerialNumberCaps).length <= 0 ){
                          // put id in storage

                                  var aUserFavorits = {};
                                  // for at sikre arrayet ikke er tom
                                  aUserFavorits[0] = "favoritter";
                                  localStorage.setItem("aUserFavorits", JSON.stringify(aUserFavorits));
                                  // tilf?je fav i array
                                  
                                  var aUserFavorits = JSON.parse(localStorage.getItem("aUserFavorits"));
                                  var iUserFavorits = Object.keys(aUserFavorits).length;
                                  aUserFavorits[iUserFavorits]= sSerialNumberCaps;
                                  
                                  localStorage.setItem("aUserFavorits", JSON.stringify(aUserFavorits));
//                                  var MyFavorits = JSON.parse(localStorage.getItem("aUserFavorits"));

//                                  var pesoFecha = {};
//                                    pesoFecha["name"] = "dannnniel";
//                                    pesoFecha[1] = "bejtrup";
//                                    localStorage.setItem("data", JSON.stringify(pesoFecha));
//                    
//                                    var arrayDeObjetos = JSON.parse(localStorage.getItem("data"));

                          // SKAL FJERNES - OG TILF?JE RELOAD AF MENU N?R MAN REMMER DEN...

                          // make favorit block    
                                $("#favoriteWrapper").append('<div class="favoriteItemWrapper"><a id="'+sSerialNumberCaps+'" href="#" data-transition="slide" class="ui-btn" onclick="GetMenucardWithSerialNumber(\''+sSerialNumberCaps+'\');">'+sRestuarentName+'<p>'+sRestuarentAddress+'</p></a></div>');
                                $(".ui-btn").on( "swiperight", FavoritDelete );
                                
                          // henter Beskeder fra Cafe (der ikke er i favoritter)
                                
                          } 
                          else {
                              // hvis cafe er i favoritter - lav besked
//                                  var data = localStorage.getItem("AA0000.Message.bodytext");
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
        
        $("#menu").append('<div class="header"><a href="#home" data-transition="slide" data-direction="reverse" id="backButtonL"><img src="img/backBlack.png"></a><h2>MyLocal<span>Cafe</span></h2><a href="#stamp" data-transition="slide" id="backButtonR"><img src="img/stampBlack2.png"></a></div>');
}

function makeHandinPage(serial,maxstamps) {
    $("#HandInBox").html("");
    var userStamps = localStorage.getItem(serial+".stamps")
    var cafeName =  localStorage.getItem(serial+".fav.cafeName")
    var StampsForFree = maxstamps;
   
    $("#HandInBox").append("<div style='display: table; margin:0 auto;'><div class='codebutton'>1</div><div class='codebutton'>2</div><div class='codebutton'>3</div><div class='codebutton'>4</div></div>");
    $("#HandInBox").append("Her indtaster caf?n Deres kode for at indl?se stempletkortet.");
    $("#HandInBox").append("<a href='#' id='HandInCardAccept'>indl?s test</a> ");
    $("#HandInBox").append("<h1>"+cafeName+"</h1>");
    $("#HandInBox").append("<div class='StampCard' id='HandinCard'></div>")
    for(var j=1; j<=StampsForFree; j++){
         $("#HandinCard").append("<div class='Stamp Full'></div>");
    }
    
    $("#HandInCardAccept").click(function(){
        
        $("#HandinCard").fadeOut(1000,function(){
            $("#HandinCard").remove();
            GetMenucardWithSerialNumber(serial);
            $.mobile.changePage("#stamp", {
                        transition: "slideup"
            });
            
        });
        
        var StampsLeft = userStamps - StampsForFree;
        localStorage.setItem(serial+".stamps", StampsLeft);
     
        // update i database
        
//        var sCustomerId = "abc123";
//        var sSerialNumber = serial;
//        
//        $.ajax({
//              type: "GET",
//              url: "http://xn--spjl-xoa.dk/MyLocalMenu/API/api.php",
//              dataType: "jSON",
//              data: {sFunction:"RedemeStampcard",iMenucardSerialNumber:sSerialNumber,sCustomerId:sCustomerId}
//             }).done(function(result){
//                 
//                    if(result.result === true){
//                    }
//            });
    });
}

