//SET GLOBALS

//Offline
//var sAPIURL = 'http://localhost/MyLocalMenu/API/api.php';
//var sAPIURLmapdata = 'http://localhost/MyLocalMenu/API/map_data.json';
//good for local testing
//device={platform :'2'};

//Online
var sAPIURL = 'http://mylocalcafe.dk/API/api.php';
var sAPIURLmapdata = 'http://mylocalcafe.dk/API/map_data.json';

window.onload = function(){
    CheckInternetConnection();
    makeFavorits();
    CheckForsCustomerId();

    //Used for search load more, infinite scroll
    localStorage.iAutocompleteCafeId = 0;
    localStorage.sAutocompleteLastName = '';

};

function ClearSearchInput(){
      $('#FindCafe').val('');
      AutocompleteCafename();
      $(".clear").hide();
      SearchInputDown();
}

function AutocompleteCafename() {

   //Check if FindCafe input element is empty
   if($('#FindCafe').val().length === 0 ) {
       $('#searchWrapper').html('');
       //$(".clear").hide();
       //$("#home").css("padding-bottom","550px");
   }
   /*if($('#FindCafe').val().length === 1) {
       $(".clear").show();
   }*/
   if($('#FindCafe').val().length >= 1) {

       //Check if ajax call is running
       if($.active === 0){

            //Show loader gif
            $('.autocompleteLoader').show();

            //console.log('search');
            var sCafename = $('#FindCafe').val();

            //If cafename has changed, reset the iAutocompleteCafeId
            if(sCafename !== localStorage.sAutocompleteLastName){

                //Set last cafename search for
                localStorage.sAutocompleteLastName = sCafename;

                //Reset the Id
                localStorage.iAutocompleteCafeId = 0;

                //Clear the result
                $('#searchWrapper').html('');
            }

            //Set the id for search
            var iCafeId = localStorage.iAutocompleteCafeId;


            $.ajax({
              type: "GET",
              url: sAPIURL,
              dataType: "jSON",
              data: {sFunction:"AutocompleteCafename",sCafename:sCafename,iCafeId:iCafeId}
             }).done(function(result){
                 if(result.result === 'true') {
                 //Clear the list
                 //$('#searchWrapper').html('').append('<h6></h6>');
                 //$('#searchWrapper').;
                 var i = 1;
                 var cafenames = '';
                 var lastId = 0;
                 $.each(result.cafe, function(key,value){
                     //Show list of posible cafenames
                     //escape single quoates from string
                     var name = value.name.replace(/'/g, "\\'");
                     cafenames += '<a class="ui-btn" onclick="GetMenucard(\''+name+'\',1);"><h1>'+value.name+'</h1><p>'+value.address+'</p></a>';
                     lastId = value.id;
                     i++;
                    });
                    //Append result to searchWrapper
                    $('#searchWrapper').append(cafenames);
                    //Set id in localStorage
                    localStorage.iAutocompleteCafeId = lastId;

                    //hide loader gif
                    $('.autocompleteLoader').hide();
                 }
                 if(i > 7){
                    $("#home").css("padding-bottom","0px");
                 }

                 if(result.result === 'done') {
                    //hide loader gif
                    $('.autocompleteLoader').hide();
                    if($('#searchWrapper').html() === '' ){

                        //alert('Den søgte café findes ikke');
                        //Show text box
                        $('#searchWrapper').html('<a class="ui-btn"><h1>Den søgte café findes ikke</h1></a>');
                    }
                 }
             });

      }

   }else{
       //Set last cafename search for
       localStorage.sAutocompleteLastName = '';

       //Reset the Id
       localStorage.iAutocompleteCafeId = 0;
   }
}

//********* Detech scroll for Autocomplete *******//

$(window).scroll(function()
{
    if($(window).scrollTop() >= $(document).height() - $(window).height())
    {
        //Run autocomplete
        AutocompleteCafename();
    }
});

//********* end *********//

function SearchInputUp() {
      var height = $(".logo_home").outerHeight();
      $("#favoriteWrapper").velocity("fadeOut", 100 );
      $(".logo_home").velocity({ "margin-top" : -height+"px" }, 500, "easeOutCubic", function(){
           document.body.scrollTop = 0;
      });
      $("#home").css("padding-bottom","550px");
      $(".clear").show();

      document.body.scrollTop = 0;

      $(".clear, #searchWrapper").show();

    $(".openMap").hide();
    document.body.scrollTop = 0;

}
function SearchInputDown() {
    if($('#FindCafe').val().length === 0) {
       $("#favoriteWrapper").velocity("fadeIn", 100 );
       $(".logo_home").velocity({ "margin-top" : 0 }, 500, "easeOutCubic");
       $("#home").css("padding-bottom","0px");
        $('.searchWrapper').hide();
        $(".openMap").show();
    }
    else {
      $('#FindCafe').focus();
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
    
    $("#OpeningHoursTodayblock img").toggleClass("rotate180","rotate90");
    
}

function MenucardItemsToggle(num) {

    $(".MenucardCategoryGroup"+num+" .dishPoint").toggleClass('out');
    $(".MenucardCategoryGroup"+num+" img").toggleClass('rotate');
}

function FavoritDelete(i) {

  var id = i.parentNode.id;


  $('#'+id).velocity("transition.expandOut", 600, function(){
      $('#'+id).before("<a class='undoDelFavorite "+id+"' data-clicked='no'><i class='fa fa-undo'></i> Fortryd</a>");

      $('.undoDelFavorite.'+id).click(function() {
         $(this).attr("data-clicked","yes");
         $(this).hide();
         $('#'+id).velocity("transition.expandIn", { display:"block", duration: 600 });
         var height =  $(this).outerHeight();
       });

      setTimeout(function(){
      $(".undoDelFavorite").velocity({ opacity: 0, height : 0 }, 300, function(){
        $('.undoDelFavorite.'+id).remove();
      });

      var isClicked = $(".undoDelFavorite").data('clicked');
      if (isClicked === "no" ){
            $('#'+id).remove();
            var aUserFavorits = JSON.parse(localStorage.getItem("aUserFavorits"));
            var iUserFavorits = Object.keys(aUserFavorits).length;
            for(var i = 0; i < iUserFavorits; i++){
              if( aUserFavorits[i]['iMenucardSerialNumber'] === id){
              delete aUserFavorits[i];
              aUserFavorits[i] = '';
              }
            }
            localStorage.setItem("aUserFavorits", JSON.stringify(aUserFavorits));
      }
      }, 3000);
  });



  //TODO: Remove the empty JSON from localStorage

  //TODO: If the localStorage aUserFavorits is empty then remove the 'Favoritter' headline

  //TODO: Also remove the cafe stamps
}

function makeFavorits() {

    var aUserFavorits = JSON.parse(localStorage.getItem("aUserFavorits"));
    if(aUserFavorits !== null ){
      $("#favoriteWrapper").empty();
      var iUserFavorits = Object.keys(aUserFavorits).length;
        var favorites = "<a class='editFavorits' onclick='editFavorits();'><i class='fa fa-cog'></i> </a><h6>Stamsteder:</h6>";
        for(var i = 0; i < iUserFavorits; i++){
            if(aUserFavorits[i].iMenucardSerialNumber !==  undefined) {
                //var sCafeId = aUserFavorits[i].iMenucardSerialNumber;
                //var sCafeName = aUserFavorits[i].cafename;
                //var sCcafeAdress = aUserFavorits[i].cafeaddress;
                favorites += '<a id="'+aUserFavorits[i].iMenucardSerialNumber+'" class="ui-btn" onclick="GetMenucard(\''+aUserFavorits[i].iMenucardSerialNumber+'\',2);"><h1>'+aUserFavorits[i].cafename+'</h1><p>'+aUserFavorits[i].cafeaddress+'</p></a>';
            }
        }
        //Append result to favoriteWrapper
        $("#favoriteWrapper").append(favorites);
    }
    else{
      $(".introScreen").show();
    }
}

var editFav = false;
function editFavorits() {
    if (editFav) {
        editFav = false;
        $(".editFavorits").removeClass("color");
        $(".deleteFavorite").remove();
        $(".favoriteWrapper .ui-btn").each(function (i) {
            var id = $(this).attr('id');
            $(this).attr("onclick", "GetMenucard('" + id + "',2);");
            $(".newMgs").show();
        });
    }
    else {
        editFav = true;
        $(".editFavorits").addClass("color");
        $(".favoriteWrapper .ui-btn").each(function (i) {
            $(this).append('<div class="deleteFavorite" onclick="FavoritDelete(this);"> <i class="fa fa-trash-o"></i></div>');
            $(this).removeAttr("onclick");
            $(this).attr("onclick", "editFavoritsAlert();");
            $(".newMgs").hide();
        });
    }
}
function editFavoritsAlert() {
    $(".fa-cog").velocity("callout.tadaaa", 700);
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
                                $("#"+index).append("<div class='newMgs'><i class='fa fa-comment'></i><div>");
                            }
                            // sæt antal stempler på menukortet
                            var Stamps = val.iNumberOfStamps;
                            if ( Stamps === null ) { var Stamps = 0; }
                            localStorage.setItem(index+".stamps", Stamps);
                            // gem stempelkort tekst
                            localStorage.setItem(index+".sStampcardText", val.sStampcardText);
                        }
                });
            }
            else{
                //TODO: Smid fejl besked
            }
       });
}

/*function findMenuCard() {

    if($("#FindCafe").val() !== '') {
        if ($("#FindCafe").val() === "clearmem"){
          localStorage.clear();
          alert('hukommelse tømt');
          location.reload();
        }
    }
    else {
        $('#FindCafe').before('<div class="popMgs"><h4>Skriv venligt et navn i søgeboksen</h4></div>');
        $('.popMgs').hide().fadeIn().delay(500).fadeOut(4300,function(){ $(this).remove(); });
    }
}*/

var IsAGalleryInRestuatent = false;
function GetMenucard(sName_sNumber,sFunction){


    //Check if any AJAX calls are running
    if($.active === 0){

            //Clear this div, is used for checking if DOM is loaded
            $('.infoBlock p').html('');

            if(sFunction === 1){
                //Get with GetMenucardWithRestuarentName
                sFunction = 'GetMenucardWithRestuarentName';
            }

            if(sFunction === 2){
                sFunction = 'GetMenucardWithSerialNumber';
            }

            $('.getmenuLoaderDiv').show();
            $("#home").velocity("fadeOut", 200, function(){
                $(window).scrollTop(0);
            }).hide();

            //Get data
            $.ajax({
              type: "GET",
              url: sAPIURL,
              dataType: "jSON",
              data: {sFunction:sFunction,sRestName_sSerialNumberNumber:sName_sNumber}
             }).done(function(result){

             var OpeningHours = '';

             if(result.result === true){

                    //******** HEAD ********//

                    var sRestuarentName = result.sRestuarentName;
                    var sRestuarentAddress = result.sRestuarentAddress;
                    $('.cafeNameField h1').html(result.sRestuarentName);
                    $('.headTitle h1').html(result.sRestuarentName);
                    $('#sRestuarentAddressHead').html(result.sRestuarentAddress);
                    $('#sRestuarentZipcodeAndCityHead').html(result.iRestuarentInfoZipcode+', '+result.sRestuarentInfoCity);

                    //******** INFO ********//

                    //Clear the openinghours
                    document.getElementById('OpeningHours').innerHTML = '';
                    $("#OpeningHoursTodayblock p").remove();

                    var sRestuarentPhone = result.sRestuarentPhone;
                    var sRestuarentPhoneFormat = sRestuarentPhone.substring(0, 2)+' '+sRestuarentPhone.substring(2, 4)+' '+sRestuarentPhone.substring(4, 6)+' '+sRestuarentPhone.substring(6, 8);

                    $('.PhoneNumber a').attr('href','tel:'+sRestuarentPhone+'').html(sRestuarentPhoneFormat);
                    
                    var OpeningHoursToday = '';
                    
                    $.each(result.aMenucardOpeningHours, function(key,value){

                            if(value.iClosed === '0'){
                                OpeningHours += '<h1>'+value.sDayName+'</h1><h2>'+value.iTimeFrom+' - '+value.iTimeTo+'</h2><br>';
                            }else if(value.iClosed === '1'){
                               OpeningHours += '<h1>'+value.sDayName+'</h1><h2>Lukket</h2><br>';
                            }                          
                    });
                    
                    /*if(result.sRestuarentOpenningToday.iClosed === '0'){
                        OpeningHoursToday = "<b>Åben i dag: </b> "+result.sRestuarentOpenningHoursToday;
                    }else if(result.sRestuarentOpenningToday.iClosed === '1'){
                        OpeningHoursToday = '<b>Lukket i dag</b>';
                    }*/
                    
                    //Append the result

                    $("#OpeningHoursTodayblock").prepend("<p>"+OpeningHoursToday+"</p>");
                    $("#OpeningHours").append(OpeningHours);


                    //******** GALLERY ********//

                    //Remove all img in .swiper-wrapper
                    $('.swiper-wrapper div').remove();

                    if(typeof result.oGallery[0] !== "undefined") {
                        var galleryimages = '';
                        $.each(result.oGallery, function(key,value){
                           galleryimages += "<div class='swiper-slide'><img width='100%' height='auto' src='data:image/x-icon;base64,"+result.oGallery[key].image+"' /></div>";
                        });
                        galleryimages += "<div class='headerGalleryFade'></div>";
                        $(".swiper-wrapper").append(galleryimages);
                        $(".menuheader").css('height','auto');
                        $('.headTitle').css('visibility', "visible");
                        IsAGalleryInRestuatent = true;

                    }
                    else {
                        IsAGalleryInRestuatent = false;
                      $(".menuheader").css("height","0px");
                        $('.headTitle').css('visibility', 'hidden');
                    }

                    //******** MESSAGES ********//

                    //Set the serial number to update localStorage data
                    if(result.iMenucardSerialNumber !== undefined ){
                      var sSerialNumberCaps = result.iMenucardSerialNumber;
                    }else{
                        var sSerialNumberCaps = sName_sNumber;
                    }

                    $("#messageBlock").empty();

                    if(typeof result.oMessages[0] !== "undefined") {

                            var sMessageDate = result.oMessages[0].date;
                            var sMessageDateCut = sMessageDate.substring(0,10);

                            //Check if message has a image
                            if(result.oMessages[0].image === undefined) {
                                $("#messageBlock").append("<div><p>"+sMessageDateCut+"</p><h1>"+result.oMessages[0].headline+"</h1><h2>"+result.oMessages[0].bodytext+"</h2></div>").show();
                            }else {
                                $("#messageBlock").append("<div><p>"+sMessageDateCut+"</p><img src='data:image/x-icon;base64,"+result.oMessages[0].image+"'><h1>"+result.oMessages[0].headline+"</h1><h2>"+result.oMessages[0].bodytext+"</h2></div>").show();
                            }
                            //Check if message has been seen
                            // var PrevMessageDate = localStorage.getItem(result.iMenucardSerialNumber+".message");
                            // if( sMessageDate == PrevMessageDate){
                            //     $(".messageBlock").removeClass("out");
                            // }
                            // else {
                            //   $(".messageBlock").addClass("out");
                              localStorage.setItem(sSerialNumberCaps+".message", sMessageDate);
                            //}
                      }
                      else{
                          $("#messageBlock").hide();
                      }



                    //******** STAMPS ********//


                    //Hide or show stampcard
                    if(result.oStampcard.iStampcardActive === '1'){
                        //Get user stamps
                        var iStamps = localStorage.getItem(sSerialNumberCaps+".stamps");
                        //Calculate stamps left
                        var iFreeItems = Math.floor(iStamps / result.oStampcard.iStampcardMaxStamps);
                        var iStampsLeft = iStamps - ( iFreeItems * result.oStampcard.iStampcardMaxStamps);
                        var sStampcardText = result.oStampcard.sStampcardText;
                        localStorage.setItem(sSerialNumberCaps+".sStampcardText", sStampcardText);
                        if(iStampsLeft === null){iStampsLeft = 0;}


                        //$('#makeStampPageBtn').attr('onclick','ShowStampPage(\''+sSerialNumberCaps+'\','+iStamps+','+result.oStampcard.iStampcardMaxStamps+');');
                        //$('#stampTotal p').html(iStampsLeft);



                        $('#makeStampPageBtn').attr('onclick','ShowStampPage(\''+sSerialNumberCaps+'\','+iStamps+','+result.oStampcard.iStampcardMaxStamps+');');
                        $('#stampTotal p').html(iStampsLeft);


                        $('#stampBlock').show();
                    }else{
                       //Hide stampcard button
                       $('#stampBlock').hide();
                    }

                    //********** MENU *********//

                    //Remove all ul in #menublock
                    $('#menuBlock ul').remove();

                    var menucategory = '';
                    var menucategorylastpart = '';
                    $.each(result.aMenucardCategory, function(key,value){

                             menucategory += '<ul class="MenucardCategoryGroup'+key+'"><li class="dishHeadline" onclick="MenucardItemsToggle('+key+');">'+value.sMenucardCategoryName+'<p>'+value.sMenucardCategoryDescription+'</p><img class="dishPointDownArrow" src="img/down_arrow.svg"></li>';
                             menucategorylastpart = '</ul>';

                             if(typeof result['aMenucardCategoryItems'+key] !== "undefined") {

                              $.each(result['aMenucardCategoryItems'+key].sMenucardItemName, function(keyItem,value){

                                  var sMenucardItemName = value;

                                  if(result['aMenucardCategoryItems'+key].iMenucardItemPrice[keyItem] !== ''){
                                    var Price = '<h2>'+result['aMenucardCategoryItems'+key].iMenucardItemPrice[keyItem]+',-</h2>';
                                  }
                                  else{
                                    var Price = '';
                                  }
                                  menucategory += '<li class="dishPoint"><h1>'+sMenucardItemName+'</h1>'+Price+'<p>'+result['aMenucardCategoryItems'+key].sMenucardItemDescription[keyItem]+'</p></li>';
                              });
                              menucategory += menucategorylastpart;
                            }
                     });

                     //Append result to DOM
                     $('#menuBlock').append(menucategory);

                     if(sFunction === 'GetMenucardWithRestuarentName'){
                           //Get with GetMenucardWithRestuarentName
                           //Add the new cafe to localStorage
                           SaveUserFavorites(result.iMenucardSerialNumber,sRestuarentName,sRestuarentAddress);
                     }

                    //******** MENU INFO *********//

                    $.each(result.aMenucardInfo, function(key,value){

                            //Replace line breaks with \n
                            var sMenucardInfoParagraph = value.sMenucardInfoParagraph.replace(/\r?\n/g, '<br/>');
                            $('.infoBlock h4').html(value.sMenucardInfoHeadline);
                            if(sMenucardInfoParagraph === ''){sMenucardInfoParagraph = '<div></div>';}
                            $('.infoBlock p').html(sMenucardInfoParagraph);
                    });


                    $('#headaddress').attr("onclick", "resMap.open('" + result.sRestuarentName.replace(/'/g, "\\'") + "','"+result.sRestuarentAddress.replace(/'/g, "\\'")+"','"+String(result.iRestuarentInfoZipcode+', '+result.sRestuarentInfoCity).replace(/'/g, "\\'")+"',"+result.oPlace.dLat+","+result.oPlace.dLng+");");



                 startRequestAnimationFrame();
                }
                else {
                    $(".spinner div").css({'animation-name':'none','width':'100%'});
                    $(".spinner").remove();
                    $('.popMgs').show();
                    $('.popMgs').hide().fadeIn().delay(4800).fadeOut(500,function(){ $(this).remove(); });
                }
            });
            CheckIfDOMLoaded();
    }
}
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

var isStaticHeaderVisible = true;
var requestAnimationFrameContinue = false;
var startRequestAnimationFrameOnResume = false;
function startRequestAnimationFrame(){
    requestAnimationFrameContinue = true;
    requestAnimFrame(removeStaticHeaderInPoint);
}
function removeStaticHeaderInPoint() {
    console.log('animatinframe');
    // Do whatever
    if(IsAGalleryInRestuatent ) {
        if(window.pageYOffset>197) {
            if (isStaticHeaderVisible) {
                $('.headTitle').css('visibility', 'hidden');
                isStaticHeaderVisible = false;
            }
        }else {
            if (!isStaticHeaderVisible) {
                $('.headTitle').css('visibility', "visible");
                isStaticHeaderVisible = true;
            }
        }
    }

    if(requestAnimationFrameContinue) {
        requestAnimFrame(removeStaticHeaderInPoint);
    }
}

function CheckIfDOMLoaded(){
    //Check if DOM is done loading
    var checkDOM = setTimeout(function(){
        if($('.infoBlock p').html() !== ''){
            $(".getmenuLoaderDiv").hide();
            $("#menu").show();

            setTimeout('1000',makeheaderGallery());
            clearTimeout(checkDOM);
            console.log('DOM loaded');
        }else{
            console.log('check again');
            CheckIfDOMLoaded();
        }
    },500);
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
                $("#favoriteWrapper").append('<a id="'+iMenucardSerialNumber+'" class="ui-btn" onclick="GetMenucard(\''+iMenucardSerialNumber+'\',2);"><h1>'+sRestuarentName+'</h1><p>'+sRestuarentAddress+'</p></a>');

        }
      }else {

         var aUserFavorites = {};
         aMenucard['iMenucardSerialNumber'] = iMenucardSerialNumber;
         aMenucard['cafename'] = sRestuarentName;
         aMenucard['cafeaddress'] = sRestuarentAddress;

         aUserFavorites[0]= aMenucard;
         aUserFavorites = JSON.stringify(aUserFavorites);
         localStorage.setItem("aUserFavorits", aUserFavorites);

         //make favorit block
         $("#favoriteWrapper").append("<a class='editFavorits' onclick='editFavorits();'><i class='fa fa-cog'></i> </a><h6>Stamsteder:</h6>");
         $("#favoriteWrapper").append('<a id="'+iMenucardSerialNumber+'" class="ui-btn" onclick="GetMenucard(\''+iMenucardSerialNumber+'\',2);"><h1>'+sRestuarentName+'</h1><p>'+sRestuarentAddress+'</p></a>');


      }

      // make favorit block
      if($("#favoriteWrapper").html() === ''){
          $("#favoriteWrapper").append("<h6>Stamsteder:</h6>");
      }
}
var SwipperGallery = false;
function makeheaderGallery() {
  SwipperGallery = new Swiper('.swiper-container',{
                pagination: '.pagination',
                loop:true,
                grabCursor: true,
                paginationClickable: true,
                autoplay: 5000
              });
              // $('.arrow-left').on('click', function(e){
              //   e.preventDefault()
              //   mySwiper.swipePrev()
              // });
              // $('.arrow-right').on('click', function(e){
              //   e.preventDefault()
              //   mySwiper.swipeNext()
              // });
}


function ShowStampPage(iMenucardSerialNumber,iUserStamps,MaxStamps){

  //Remove .stampCircleIcon
  $('#FreeItemsBlock .stampCircleIcon').remove();
  $('.useStampsBtn').remove();
  $('.textuse').remove();

  var iUserStamps = iUserStamps;
  var iStampsForFree = MaxStamps;

  var iFreeItems = Math.floor(iUserStamps / iStampsForFree);
  var iStampsLeft = iUserStamps - ( iFreeItems * iStampsForFree);

  // make gallery disapper
  $(".infoBlock").velocity("fadeOut",200);
  $("#menuBlock").velocity("transition.slideDownBigOut", 100, function(){
      $("#scrollerAnchorHead").hide();
      $(".headTitle").addClass("fixedTop");
      $(".swiper-container").velocity({ "height" : 0 }, 300);
        $("#messageBlock").velocity("transition.slideUpBigOut",200);

                    $("#stampBlock").velocity("transition.slideUpBigOut", 400, function(){
                          $("#stampBlock").hide();
                          $(".headTitleInfoblock").hide();

                          // back btn change
                          $(".backBtn").attr("onclick","backBtnSwich('hideStampPage');").removeClass("rotate270");;
                          $(window).scrollTop(0);
                          $("#stampPage a").hide().velocity("transition.bounceDownIn",400);
                          $('.StampsForNext').attr('onclick',"ShowKeyPad(\""+iMenucardSerialNumber+"\",1);");
                          $('#stampPage').show();
                          $(".stampCircle").hide().velocity("transition.expandIn", 200, function(){

                                  makeStampCounter(iStampsLeft,iStampsForFree);

                                  $('.stampcardText').html(localStorage.getItem(iMenucardSerialNumber+".sStampcardText"));
                                  $('.iFreeItemCounter').html('Du har nu '+iFreeItems+' gratis');
                                  if( iFreeItems > 0 ){
                                      $("#FreeItemsBlock").html("<h3 class='textuse'>brug:</h3>");
                                  }
                                  var freeItemsString = '';
                                  for (var i = 1; i <= iFreeItems; i++){
                                      freeItemsString += "<div class='stampCircleIcon' onclick='ChooseStampCircle(this);'><p>"+i+"</p></div>";
                                  }
                                  $("#FreeItemsBlock").append(freeItemsString);

                                  $("#FreeItemsBlock .stampCircleIcon").hide().velocity("transition.slideUpIn", { display:"inline-block", duration: 800 });

                                  $("#stampPage").append("<a class='useStampsBtn' onclick='ShowKeyPad(\""+iMenucardSerialNumber+"\",2,"+MaxStamps+");'>OK</a>");
                      });
              });
      });

}

function ChooseStampCircle(elem) {

    $( "#FreeItemsBlock div" ).removeClass("choosenstampicon");

    var elemNum = $(elem).index();
    $( "#FreeItemsBlock div" ).each(function() {
        if ( $(this).index() <= elemNum ){
          $(this).toggleClass("choosenstampicon");
        }
    });


    //Hide show useStampsBtn
    if($('.choosenstampicon').length >= 1){
        $('.useStampsBtn').show();
    }else{
       $('.useStampsBtn').hide();
    }

}
function backBtnSwich(action){
  switch(action) {
    case "home":
        requestAnimationFrameContinue = false;
        IsAGalleryInRestuatent = false;

        if(pinMap.openFromMap) {
            pinMap.goBackFromMenu();
        }else{
            showHomePage();
        }

        break;
    case "hideStampPage":
        hideStampPage();
        break;
    case "hideGetStampsPage":
        hideGetStampsPage();
        break;
    default:

  }
}

function showHomePage(){
  $("#menu").hide();
  $("#home").velocity("fadeIn", 1000);
  $(".introScreen").hide();
}

function hideStampPage(){
  $("#stampPage").hide();
  $(".swiper-container").velocity({ "height" : 200 }, 200);
  $(".infoBlock").velocity("fadeIn",200);
  $("#stampBlock").velocity("transition.slideDownBigIn",400);
  if( $("#messageBlock div").length > 0 ){
    $("#messageBlock").velocity("transition.slideDownBigIn",600);
  }
  $("#menuBlock").velocity("transition.slideUpBigIn", 400);
  $(".backBtn").attr("onclick","backBtnSwich('home');").addClass("rotate270");
  $(".headTitleInfoblock").show();
  $("#scrollerAnchorHead").show();
  $(".headTitle").removeClass("fixedTop");
}


function hideGetStampsPage(){
  $(".keypad").velocity("transition.slideDownBigOut", 200);
  $(".keypad").hide();
  $("#getStampPage").velocity("transition.slideUpBigOut", 200, function() {
      $("#getStampPage").hide();
      $("#stampPage").velocity("transition.shrinkIn", 400);
      $(".backBtn").attr("onclick","backBtnSwich('hideStampPage');").removeClass("rotate270");
  });

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
}

function ShowKeyPad(iMenucardSerialNumber,sFunction,iMaxStamp){
    $('.inputGetStamp span').remove();
  if(sFunction === 1){

        //Show the keypad for get stamp
        $("#stampPage").velocity("transition.shrinkOut", 400, function(){

          $("#stampPage").hide();
          $(".backBtn").attr("onclick","backBtnSwich('hideGetStampsPage');").addClass("rotate270");

          $('#GetStampBtn').attr('onclick',"GetStamp(\""+iMenucardSerialNumber+"\");");

          $(".keypad").hide();
          $(".inputGetStampwrapper").hide();
          $('#redemeStampDiv').hide();
          $('#getStampDiv').show();
          $("#getStampPage").hide().velocity("transition.slideDownBigIn", 200, function(){
              $(".keypad").velocity("transition.slideUpBigIn", 200);
              $(".inputGetStampwrapper").velocity("transition.slideUpBigIn", 200);
          });
          $(window).scrollTop(0);
    });
  }else if(sFunction === 2){
        //Show keypad for Redeme stamp
        $("#stampPage").velocity("transition.shrinkOut", 400, function(){
          $("#stampPage").hide();
          $(".backBtn").attr("onclick","backBtnSwich('hideGetStampsPage');").addClass("rotate270");

          //Get number of freeitems
          var iNumberOfFreeItems = $('.choosenstampicon').length;
          //Convert iNumberOfFreeItems to stamps
          //var iNumberOfStamps = iNumberOfFreeItems * iMaxStamp; <= viser alle stempler
          $(".numOfStamps").html(iNumberOfFreeItems);
          $('#GetStampBtn').attr('onclick',"UseStamp(\""+iMenucardSerialNumber+"\","+iMaxStamp+");");

          $(".keypad").hide();
          $('#redemeStampDiv').show();
          $('#getStampDiv').hide();
          $("#getStampPage").hide().velocity("transition.slideUpBigIn", 200, function(){
              $(".keypad").velocity("transition.slideUpBigIn", 200);
          });
        });
        $(window).scrollTop(0);
  }
}

function numOfStampsChange(num){
  var numbersOfStamps = parseInt( $("#numOfStamps").text() );
  var numbersOfStamps = numbersOfStamps + num;
  if( numbersOfStamps <= 0 ){ numbersOfStamps = 1; }
  $("#numOfStamps").text(numbersOfStamps);
}



function btnKeypad(num){
  var i = 1;
  if( num < 0 ){
     for( var j = 1; j <= 4; j++ ){
        var a = $("#inputGetStamp"+j+" span").length;
        if($("#inputGetStamp"+j+" span").length === 1){ var i = j; }
      }
      $("#inputGetStamp"+i+" span").remove();
  }
  else{
      for( var j = 1; j <= 4; j++ ){
        var a = $("#inputGetStamp"+j+" span").length;
        if($("#inputGetStamp"+j+" span").length === 1){ var i = j+1; }
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
                 $(".backBtn").attr("onclick","backBtnSwich('hideStampPage');").removeClass("rotate270");
                 $(".backBtn").addClass("rotate270");

                 // opdater antal stempler i localStorage
                 var stamps = localStorage.getItem(iMenucardSerialNumber+".stamps");
                 var stamps = parseInt(stamps) - parseInt(iNumberOfStamps);
                 localStorage.setItem(iMenucardSerialNumber+".stamps",stamps);

                 // animation
                $(".stampRedemeMessage").show();

                 $('.keypad').hide();
                 $('.inputGetStampwrapper').hide();
                 $('#redemeStampDiv').hide();
                 setTimeout(function(){

                    $(".stampRedemeMessage").hide(); 
                    $('.keypad').show();
                    $('.inputGetStampwrapper').show();
                    $('#redemeStampDiv').show(); 
                    
                    //Remove old password
                    $('.inputGetStamp').html(''); 

                    $(".stampRedemeMessage").hide();
                    $('.keypad').show();
                    $('.inputGetStampwrapper').show();
                    $('#redemeStampDiv').show();

                    //Remove old password
                    $('.inputGetStamp').html('');


                    $("#getStampPage").hide().velocity("transition.slideDownBigOut", 300, function() {


                          //$(".inputGetStampwrapper").remove();
                           $("#getStampPage").velocity("transition.slideDownBigOut", 300, function() {

                                  $(".stampRedemeMessage").hide();
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
                                       $('#makeStampPageBtn').attr('onclick','ShowStampPage(\''+iMenucardSerialNumber+'\','+stamps+','+iStampsForFree+')');

                                  });
                                });
                          });

                }, 1800);

                $(".useStampsBtn").hide();
                if( $("#FreeItemsBlock > div").length <= 0){
                  $("#FreeItemsBlock h3").remove();
                }
                // rename freeCircles
                $( "#FreeItemsBlock div" ).each(function() {
                  var num = $(this).index();
                  $(this).html("<p>"+num+"</p>");
                });

             }
             else{
                  $("#menu").addClass("error");
                      setTimeout(function(){
                          $("#menu").removeClass("error");
                      },300);
                      $(".inputGetStamp span").remove();
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
 @GetStamp()
    -Description: Get stamp
 */
function GetStamp(iMenucardSerialNumber){


  var numbersOfStamps = $("#numOfStamps").text();
  if ($("#inputGetStamp4 span").length === 1){
$('.getmenuLoaderDiv').show();
      var Stampcode = $('#inputGetStamp1 span').html()+''+$('#inputGetStamp2 span').html()+''+$('#inputGetStamp3 span').html()+''+$('#inputGetStamp4 span').html();
      Stampcode = parseInt(Stampcode);

      var sCustomerId = localStorage.getItem("sCustomerId");
      $.ajax({
              type: "GET",
              url: sAPIURL,
              dataType: "jSON",
              data: {sFunction:"GetStamp",sCustomerId:sCustomerId,Stampcode:Stampcode,iMenucardSerialNumber:iMenucardSerialNumber,iNumberOfStamps:numbersOfStamps}
             }).done(function(result){
                    $('.getmenuLoaderDiv').hide();
                    if(result.result === 'true') {

                        //Remove old password
                        $('.inputGetStamp').html('');

                        //Opdater antal stempler i localStorage
                        var stamps = localStorage.getItem(iMenucardSerialNumber+".stamps");
                        console.log('stamps: '+stamps);
                        if( stamps === null ) { var stamps = 0; }
                        var stamps = parseInt(stamps) + parseInt(numbersOfStamps);
                        localStorage.setItem(iMenucardSerialNumber+".stamps",stamps);

                        $(".backBtn").attr("onclick","backBtnSwich('hideStampPage');").removeClass("rotate270");;

                        // animation
                         $("#getStampPage").velocity("transition.slideDownBigOut", 200, function() {


                                 $("#stampPage").velocity("transition.expandIn", 400, function(){
                                     var stampsCounterText = $("#stampsCounterText").text().split('/');
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
                                            $(".stampCircleFillNew").velocity("transition.expandOut",{ delay: 2500 }, 400);
                                          });
                                          makeStampCounter(0,iStampsForFree);
                                      }, 200);

                                        var restStamps = newChecker - ( iStampsForFree * counterFree );
                                        setTimeout(function(){makeStampCounter(restStamps,iStampsForFree);},1900);
                                        $("#stampTotal p").text(restStamps);

                                        //Display all the free items
                                        $("#FreeItemsBlock").prepend("<h3>brug:</h3>");
                                        var freeitemsString = '';
                                        for (var i = 1; i < iFreeItems; i++){
                                             freeitemsString += "<div class='stampCircleIcon' onclick='ChooseStampCircle(this);'><p>"+i+"</p></div>";
                                        }
                                        $("#FreeItemsBlock").append(freeitemsString);

                                        setTimeout(function(){
                                           $("#FreeItemsBlock").append("<div id='getNewfreeAni' class='stampCircleIcon' onclick='ChooseStampCircle(this);'><p>"+i+"</p></div>");
                                           // New Free item Animation
                                           if( iFreeItems > parseInt(oldFreeItems) ) {
                                              $("#getNewfreeAni").velocity("transition.shrinkIn", { display:"inline-block", stagger: 100, duration: 900 });
                                           }
                                        }, 600);
                                    }
                                    else{
                                        $("#stampTotal p").text(iStampsLeft);
                                        makeStampCounter(iStampsLeft,iStampsForFree);
                                        var freeitemsString = '';
                                        for (var i = 1; i <= iFreeItems; i++){
                                            freeitemsString += "<div class='stampCircleIcon' onclick='ChooseStampCircle(this);'><p>"+i+"</p></div>";
                                        }
                                        $("#FreeItemsBlock").append(freeitemsString);
                                    }
                                     //Change onlick event of btn
                                     $('#makeStampPageBtn').attr('onclick','ShowStampPage(\''+iMenucardSerialNumber+'\','+stamps+','+iStampsForFree+')');

                                });
                         });

                    }else{
                      $("#menu").addClass("error");
                      setTimeout(function(){
                          $("#menu").removeClass("error");
                      },300);
                      $(".inputGetStamp span").remove();
                    }
       });
  } else{
        for(var i = 1; i <= 4; i++){
           if($("#inputGetStamp"+i+" span").length === 0){
                 $("#inputGetStamp"+i).velocity("callout.tada", 400 );
           }
         }
  }
}

 function moveScrollerHead() {
    var move = function() {
        var st = $(window).scrollTop();
        var ot = $("#scrollerAnchorHead").offset().top;
        var s = $(".headTitle");
        if(st > ot) {
            s.css({
                position: "fixed",
                top: "0px"
            });
            s.addClass("shadow");
            var height = s.outerHeight();
            //height = height;
            $(".headTitleInfoblock").css("margin-top", height+"px");

        } else {
            if(st <= ot) {
                s.css({
                    position: "relative",
                    top: ""
                });
                s.removeClass("shadow");
                $(".headTitleInfoblock").css("margin-top", "0px");
            }
        }
    };
    $(window).scroll(move);
    move();
}

var resMap = {
    map:false,
    pin: false,
    place: {lat:0,lng:0},
    henterPlacering :false,
    isPinToLocation:false,
    herErJeg: new google.maps.Marker({
        position: new google.maps.LatLng(0, 0),
        icon: new google.maps.MarkerImage("img/mapHereAreYou.png",
            new google.maps.Size(14, 14),
            new google.maps.Point(0,0),
            new google.maps.Point(7,7)
        )
    }),
    herErJegA: new google.maps.Circle({
        center:new google.maps.LatLng(0, 0),
        radius:0,
        fillColor:"#1966e8",
        fillOpacity:0.1,
        strokeOpacity:0,
        strokeWeight:0
    }),
    isResMapOpen:false,
    open:function(navn, addr, by, lat, lng){
        this.place.lat = lat;
        this.place.lng = lng;
        this.isResMapOpen = true;
        $('#menu').velocity('fadeOut',200);
        $('#res_map').velocity('fadeIn',200);
        $('#res_map_addr_navn').html(navn);
        $('#res_map_addr_addr').html(addr);
        $('#res_map_addr_by').html(by);
        //Check for platform©
        if(device.platform === 'iOS'){
            //var geolink = 'comgooglemaps://?center='+lat+','+lng+'&zoom=14';
            var geolink = 'maps:q=loc:'+lat+'+'+lng;
        }
        else{
            geolink = 'geo:'+lat+','+lng+'?q='+addr+'+'+by;
        }
        $('#res_map_link').attr("href",geolink);


        window.requestAnimationFrame(function(){
            $('#res_map_gps_fail, #res_map_min_placering, #res_map_min_placering_load').css('bottom', $('#res_map_addr').height()+45);
        });



        if(this.map===false) {
            this.map = new google.maps.Map(document.getElementById("res_map_google_map"), {
                center: new google.maps.LatLng(lat, lng),
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [
                            { visibility: "off" }
                        ]
                    }
                ]
            });
            google.maps.event.addListenerOnce(this.map, 'idle', function(){
                google.maps.event.trigger(resMap.map, "resize");
                resMap.map.setCenter(new google.maps.LatLng(lat, lng));
            });
            google.maps.event.addListener(this.map, 'dragstart', function(){
                if (resMap.isPinToLocation) {
                    resMap.isPinToLocation = false;
                    $('#res_map_min_placering').css('color', '#FFFFFF');
                }
            });
            google.maps.event.addListener(this.map, 'zoom_changed', function(){
                if (resMap.isPinToLocation) {
                    resMap.isPinToLocation = false;
                    $('#res_map_min_placering').css('color', '#FFFFFF');
                }
            });
            this.pin = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                title: navn,
                animation: google.maps.Animation.DROP,
                icon: new google.maps.MarkerImage("img/cafeHere.png",
                    new google.maps.Size(43, 50),
                    new google.maps.Point(0,0),
                    new google.maps.Point(21, 50)
                )
            });
            this.pin.setMap(this.map);
        }else {
            setTimeout(function(){
                google.maps.event.trigger(resMap.map, "resize");
            }, 500)

            this.map.setCenter(new google.maps.LatLng(lat, lng));
            this.pin.setPosition(new google.maps.LatLng(lat, lng));
            this.pin.setTitle(navn);
        }

        if(pinMap.lastPosition.latitude !== 0 && pinMap.lastPosition.longitude !==0) {
            if(typeof resMap.herErJeg.getMap() === "undefined") {
                resMap.herErJeg.setMap(resMap.map);
                resMap.herErJegA.setMap(resMap.map);
            }
            resMap.herErJeg.setPosition(pinMap.herErJeg.getPosition());
            resMap.herErJegA.setCenter(pinMap.herErJeg.getPosition());
            resMap.herErJegA.setRadius(pinMap.herErJegA.getRadius());

        }
    },

    getLocation: function(){
        if (!this.henterPlacering) {
            if(!this.isPinToLocation) {
                this.isPinToLocation = true;
                $('#res_map_min_placering').css('color', '#008ED2');

                if( pinMap.wathId ) {
                    this.centerMap();
                }else {
                    if (pinMap.lastPosition.latitude !==0&&pinMap.lastPosition.longitude!==0) {
                        this.centerMap();
                    }

                    this.henterPlacering = true;
                    $('#res_map_min_placering_load').show();


                    pinMap.wathId = navigator.geolocation.watchPosition(
                        resMap.showPosition
                        ,resMap.gps_fail, {
                            'enableHighAccuracy': true,
                            'maximumAge': 15000,
                            'timeout': 14000
                        });
                    setInterval(function(){
                        if(pinMap.firstLocation) {
                            navigator.geolocation.clearWatch(pinMap.wathId);
                            pinMap.wathId = navigator.geolocation.watchPosition(
                                resMap.showPosition
                                ,resMap.gps_fail, {
                                    'enableHighAccuracy': true,
                                    'maximumAge': 15000,
                                    'timeout': 14000
                                });
                        }
                    },33000);
                }
            }else {
                this.isPinToLocation = false;
                $('#res_map_min_placering').css('color', '#FFFFFF');
            }
        }
    },
    showGpsFail: false,
    showPosition: function(place){
        resMap.henterPlacering=false;
        $('#res_map_min_placering_load').hide();

        if(resMap.showGpsFail) {
            resMap.showGpsFail = false;
            $('#res_map_gps_fail').fadeOut();
        }

        pinMap.lastPosition = place.coords;
        pinMap.updatePinsAndListOnOpen = true;


        if(typeof resMap.herErJeg.getMap() === "undefined") {
            resMap.herErJeg.setMap(resMap.map);
            resMap.herErJegA.setMap(resMap.map);
        }
        resMap.herErJeg.setPosition(new google.maps.LatLng(place.coords.latitude, place.coords.longitude));
        resMap.herErJegA.setCenter(new google.maps.LatLng(place.coords.latitude, place.coords.longitude));
        resMap.herErJegA.setRadius(place.coords.accuracy);



        if(resMap.isPinToLocation) {
            resMap.centerMap();
        }
    },
    gps_fail: function(){
        resMap.showGpsFail = true;
        $('#res_map_gps_fail').fadeIn();
    },
    centerMap: function(){
        this.map.panTo(this.herErJeg.getPosition());
    },
    close:function(){
        this.isResMapOpen = false;
        if( pinMap.wathId ) {
            navigator.geolocation.clearWatch(pinMap.wathId);
        }
        $('#menu').velocity('fadeIn',200);
        $('#res_map').velocity('fadeOut',200);
        setTimeout(function(){
            SwipperGallery.resizeFix()
        }, 50)
    }
};
var pinMap = {
    distanceFrom:function(points) {
        return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(Math.pow(Math.sin((points.lat1 * (Math.PI / 180) - points.lat2 * (Math.PI / 180)) / 2), 2.0) + Math.cos(points.lat1 * (Math.PI / 180)) * Math.cos(points.lat2 * (Math.PI / 180)) * Math.pow(Math.sin((points.lng1 * (Math.PI / 180) - points.lng2 * (Math.PI / 180)) / 2), 2.0))));
    },
    firstLocation: true,
    map:false,
    mapData:false,
    pinsIsShow:[], // id på alle markerne på kortet
    pinData:[],
    wathId:false,
    herErJeg: new google.maps.Marker({
        position: new google.maps.LatLng(0, 0),
        icon: new google.maps.MarkerImage("img/mapHereAreYou.png",
            new google.maps.Size(14, 14),
            new google.maps.Point(0,0),
            new google.maps.Point(7,7)
        )
    }),
    herErJegA: new google.maps.Circle({
        center:new google.maps.LatLng(0, 0),
        radius:0,
        fillColor:"#1966e8",
        fillOpacity:0.1,
        strokeOpacity:0,
        strokeWeight:0
    }),
    openFromMap: false,
    isListOpen: true,
    lastPosition: {latitude:0,longitude:0},
    isPinToLocation: false,
    previewCafe: false,
    updatePinsAndListOnOpen:false,
    initMap:function(center){
        pinMap.map = new google.maps.Map(document.getElementById("google_map"), {
            center: new google.maps.LatLng(center.latitude, center.longitude),
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [
                        { visibility: "off" }
                    ]
                }
            ]
        });
        google.maps.event.addListenerOnce(pinMap.map, 'idle', function(){
            google.maps.event.trigger(pinMap.map, "resize");
            if(pinMap.lastPosition!=={latitude:0,longitude:0}) {
                pinMap.map.setCenter(new google.maps.LatLng(pinMap.lastPosition.latitude, pinMap.lastPosition.longitude));
            }
        });
        google.maps.event.addListener(pinMap.map, 'dragend', function() {
            if(pinMap.mapData !== false) {
                pinMap.updatePins();
            }
        });
        google.maps.event.addListener(pinMap.map, 'dragstart', function() {
            if( pinMap.isPinToLocation){
                pinMap.isPinToLocation = false;
                $('#map_min_placering').css('color', '#FFFFFF');
            }
        });
        google.maps.event.addListener(pinMap.map, 'click', function() {
            pinMap.closePreviewCafe();
        });
        google.maps.event.addListener(pinMap.map, 'zoom_changed', function() {
            if(pinMap.mapData !== false) {
                pinMap.updatePins();
            }
            if( pinMap.isPinToLocation){
                pinMap.isPinToLocation = false;
                $('#map_min_placering').css('color', '#FFFFFF');
            }
        });
        pinMap.herErJeg.setMap(pinMap.map);
        pinMap.herErJegA.setMap(pinMap.map);
    },
    showPosition: function (position) {
        if (pinMap.firstLocation) {
            pinMap.firstLocation = false;
            pinMap.init_map_and_info_elements(position.coords);
        }

        if(pinMap.isPinToLocation) {
            pinMap.map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
        }
        if(pinMap.previewCafe !== false) {
            $('#before_open_cafe_dist').html(Math.round(pinMap.distanceFrom(({
                'lat1': pinMap.lastPosition.latitude,
                'lng1': pinMap.lastPosition.longitude,
                'lat2': pinMap.previewCafe[2],
                'lng2': pinMap.previewCafe[3]
            })) * 10) / 10 + "km");
        }

        pinMap.herErJeg.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
        pinMap.herErJegA.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
        pinMap.herErJegA.setRadius(position.coords.accuracy);
        if(pinMap.mapData === false) {
            $.get(sAPIURLmapdata, function(data) {
                if(typeof data === "string") {
                    data = JSON.parse(data);
                }
                pinMap.mapData=data;
                pinMap.updatePins();
                pinMap.updateList(position.coords, false);
            });
        }else {
            pinMap.updatePins();
            pinMap.updateList(position.coords, false);
        }
        delete pinMap;
    },
    gps_fail: function() {
        $('#map_henter_placering p').html("Henter placering . . .<br><span style='font-weight: bold'>Aktiver din gps hvis den er slået fra</span>");
    },
    init_map_and_info_elements: function(center){
        $('#map_henter_placering').velocity("fadeOut", 200);
        $('#map_list, #map_toggle_outer, #map_placering_outer').velocity('fadeIn', 200);
        $('#map #map_min_placering').velocity({opacity:1}, 200);

        if(pinMap.map===false) {
            pinMap.initMap(center);

        }
    },
    openMap: function openMapFromHome() {
        $("#home").velocity("fadeOut", 200, function () {
            $(window).scrollTop(0);
        }).hide();
        $('#map').velocity('fadeIn', 200);
        this.wathId = navigator.geolocation.watchPosition(
            this.showPosition
            ,this.gps_fail, {
                 'enableHighAccuracy': true,
                'maximumAge': 15000,
                'timeout': 14000
            });
        setInterval(function(){
            if(pinMap.firstLocation) {
                navigator.geolocation.clearWatch(pinMap.wathId);
                pinMap.wathId = navigator.geolocation.watchPosition(
                    pinMap.showPosition
                    ,pinMap.gps_fail, {
                         'enableHighAccuracy': true,
                        'maximumAge': 15000,
                        'timeout': 14000
                    });
            }
        },33000);
        if(this.map!==false) {
            setTimeout(function(){
                google.maps.event.trigger(pinMap.map, "resize");
            }, 500)
        }
        if(this.updatePinsAndListOnOpen && this.lastPosition.latitude !== 0 && this.lastPosition.longitude !== 0) {
            this.updatePinsAndListOnOpen = false;
            this.firstLocation = false;

            pinMap.init_map_and_info_elements(this.lastPosition);

            pinMap.herErJeg.setPosition(new google.maps.LatLng(this.lastPosition.latitude, this.lastPosition.longitude));
            pinMap.herErJegA.setCenter(new google.maps.LatLng(this.lastPosition.latitude, this.lastPosition.longitude));
            pinMap.herErJegA.setRadius(this.lastPosition.accuracy);


            if(pinMap.mapData === false) {
                $.get(sAPIURLmapdata, function(data) {
                    if(typeof data === "string") {
                        data = JSON.parse(data);
                    }
                    pinMap.mapData=data;
                    pinMap.updatePins();
                    pinMap.updateList(pinMap.lastPosition, true);
                });
            }else {
                this.updatePins();
                this.updateList(this.lastPosition, true);
            }
        }
    },
    updatePins: function (){
        var area = this.map.getBounds();
        for (var i = 0; i < this.mapData.length; i++) {
            var obj = this.mapData[i];
            if(!(this.pinsIsShow.indexOf(i) > -1)) {
                if(
                    obj[2] > area.Ea.k &&
                    obj[2] < area.Ea.j &&
                    obj[3] > area.wa.j &&
                    obj[3] < area.wa.k
                ){
                    this.pinsIsShow.push(i);


                    var mapmarker = new google.maps.Marker({
                        position: new google.maps.LatLng(obj[2], obj[3]),
                        title: obj[1],
                        animation: google.maps.Animation.DROP,
                        icon: new google.maps.MarkerImage(
                            (pinMap.previewCafe === false || pinMap.previewCafe === i?"img/ny_cafe_here.png":"img/ny_cafe_here_fade_out.png"),
                            new google.maps.Size(43, 50),
                            new google.maps.Point(0,0),
                            new google.maps.Point(21, 50)
                        )
                    });
                    this.pinData[i] = (
                    {
                        obj: obj,
                        mapmarker: mapmarker
                    }
                    );
                    this.pinData[i].mapmarker.setMap(this.map);
                    google.maps.event.addListener(mapmarker, 'click', (function (mapmarker, i) {
                        return function () {
                            pinMap.openMenu(i);
                        };
                    })(mapmarker, i));
                }
            }
        }
    },
    updateList: function (cords, force){
        if(
            Math.abs(cords.latitude-this.lastPosition.latitude) < 0.0003 &&
            Math.abs(cords.longitude-this.lastPosition.longitude) < 0.0003 &&
            !force
        ){
            return;
        }
        this.lastPosition = cords;
        var result = [];
        for (var i = 0; i < this.mapData.length; i++) {
            var obj = this.mapData[i];
            var afstand = this.distanceFrom({
                'lat1': cords.latitude,
                'lng1': cords.longitude,
                'lat2': obj[2],
                'lng2': obj[3]
            });
            if (afstand < 5.01) {
                result.push({afstand: afstand, hvad: obj, id:i});
            }
            delete obj;
            delete afstand;
        }
        result.sort(function (a, b) {
            return a.afstand - b.afstand;
        });
        if (result.length === 0) {
            $('#vis').html('');
            $('#map_list_ingen_resultater').show();
        } else {
            $('#map_list_ingen_resultater').hide();
        }
        var liste_html="";
        for (var i = 0; i < result.length; i++) {
            liste_html += '<div onclick="pinMap.openMenu('+result[i].id+')"><table><tr><td>' + result[i].hvad[0] + '</td><td>' + Math.round(result[i].afstand * 10) / 10 + ' km</td></tr><tr><td>' + result[i].hvad[1] + '</td></tr></table></div>';
        }
        $('#map_list_data').html(liste_html);
        delete liste_html;
        delete result;
    },
    openMenu: function(id){
        var obj = pinMap.mapData[id];
        if(pinMap.previewCafe === obj) {
            this.openFocusedCafe();
        }else {
            pinMap.previewCafe = obj;

            if(pinMap.map.getZoom()<13) {
                pinMap.map.setZoom(15);
            }
            pinMap.map.panTo(new google.maps.LatLng(obj[2], obj[3]));
            pinMap.updatePins();

            $('#map_list_outer').velocity({opacity: 0}).delay(400).hide();
            $('#before_open_cafe').velocity({opacity: 1, bottom: 0}).show();

            setTimeout(function () {
                $("#map_list").css("bottom", -1000);
            }, 450);

            $('#before_open_cafe_name').html(obj[0]);
            $('#before_open_cafe_addr').html(obj[1]);
            $('#before_open_cafe_dist').html(Math.round(pinMap.distanceFrom(({
                'lat1': pinMap.lastPosition.latitude,
                'lng1': pinMap.lastPosition.longitude,
                'lat2': obj[2],
                'lng2': obj[3]
            })) * 10) / 10 + "km");

            $('#map_min_placering').velocity({bottom: $('#before_open_cafe').height()+50 });

            for (marker in pinMap.pinData) {
                if (pinMap.pinData[marker].obj !== obj) {
                    pinMap.pinData[marker].mapmarker.setIcon(
                        new google.maps.MarkerImage("img/ny_cafe_here_fade_out.png",
                            new google.maps.Size(43, 50),
                            new google.maps.Point(0, 0),
                            new google.maps.Point(21, 50)
                        )
                    );
                    pinMap.pinData[marker].mapmarker.setZIndex(parseInt(marker));
                }
            }
            pinMap.pinData[id].mapmarker.setIcon(new google.maps.MarkerImage("img/ny_cafe_here.png",
                new google.maps.Size(43, 50),
                new google.maps.Point(0, 0),
                new google.maps.Point(21, 50)
            ));
            pinMap.pinData[id].mapmarker.setZIndex(google.maps.Marker.MAX_ZINDEX);

        }

    },
    goBackFromMenu: function(){
        pinMap.openFromMap = false;
        $("#menu").hide();
        $(".introScreen").hide();
        $('#map').velocity('fadeIn', 200);
        this.wathId = navigator.geolocation.watchPosition(
            this.showPosition
            ,this.gps_fail, {
                'enableHighAccuracy': true,
                'maximumAge': 15000,
                'timeout': 14000
            });
    },
    closeMap: function () {
        navigator.geolocation.clearWatch(this.wathId);
        $('#map').velocity('fadeOut', 200);
        $("#home").velocity("fadeIn", 200);
    },
    centerMapLocation: function(){
        if(this.map) {
            if(this.isPinToLocation) {
                this.isPinToLocation = false;
                $('#map_min_placering').css('color', '#FFFFFF');
            }else{
                this.isPinToLocation = true;
                $('#map_min_placering').css('color', '#008ED2');
                this.map.panTo(this.herErJeg.getPosition());
            }
        }
    },
    openFocusedCafe: function () {
        if(this.previewCafe !== false) {
             navigator.geolocation.clearWatch(this.wathId);
             $('#map').velocity('fadeOut', 200);
             pinMap.openFromMap = true;
             GetMenucard(this.previewCafe[0],1);
        }
    },
    closePreviewCafe: function(){
        pinMap.previewCafe = false;

        $('#map_list_outer').velocity({opacity:1}).show();
        $('#before_open_cafe').velocity({opacity:0, bottom:-10}).delay(400).hide();

        if(pinMap.isListOpen) {
            $("#map_list").css("bottom", 0);
            $("#map_min_placering").velocity({bottom:  window.innerHeight * .45 + 20 });
        }else{
            $("#map_list").css("bottom", (((window.innerHeight * .45) - 32)*-1));
            $("#map_min_placering").velocity({bottom: 53 });

        }

        for (marker in  pinMap.pinData) {
            pinMap.pinData[marker].mapmarker.setIcon(
                new google.maps.MarkerImage("img/ny_cafe_here.png",
                    new google.maps.Size(43, 50),
                    new google.maps.Point(0,0),
                    new google.maps.Point(21, 50)
                )
            );
        }
    }
};
Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
    return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
};
google.maps.event.addDomListener(window, 'load', function(){
    $('#map_go_back').click(function(){
        if(pinMap.previewCafe===false) {
            pinMap.closeMap();
        }else {
            pinMap.closePreviewCafe();
        }
    });
    $('.openMap').click(function(){
        pinMap.openMap();
    });
    $('#map_min_placering').click(function () {
        pinMap.centerMapLocation();
    });
    $('#res_map_min_placering').click(function () {
        resMap.getLocation();
    });
    $('#before_open_cafe').click(function () {
        pinMap.openFocusedCafe();
    });

    var map_list = document.getElementById('map_list');
    var map_outer_list = document.getElementById('map_list_outer');
    var map_list_inner = document.getElementById('map_list_inner');
    var map_list_content = document.getElementById('map_list_content');
    var map_drag_up = document.getElementById('map_drag_up');
    var map_min_placering = document.getElementById('map_min_placering');
    map_min_placering.style.bottom = window.innerHeight * .45 + 20 + "px";


    var starty = 0;
    var curentdist = 0;
    var drag_down = false;
    var drag_up = false;
    $( window ).resize(function() {
        if(!pinMap.isListOpen) {
            map_list.style.bottom =  "-"+(((window.innerHeight*.45)-32))+"px";
        }
        if(pinMap.previewCafe !== false){
            map_min_placering.style.bottom = $('#before_open_cafe').height()+50+"px";
        }else if(pinMap.isListOpen) {
            map_min_placering.style.bottom = window.innerHeight * .45 + 20 + "px";
        }
        if(resMap.isResMapOpen) {
            $('#res_map_gps_fail, #res_map_min_placering, #res_map_min_placering_load').css('bottom', $('#res_map_addr').height()+45);
        }
    });
    map_drag_up.onclick=function(){
        $(map_list).velocity({bottom: 0});
        $(map_list_content).velocity({opacity:1, marginTop:0});
        $(map_drag_up).velocity({opacity:0}, function(){
            map_drag_up.style.display = "none";
        });
        pinMap.isListOpen = true;
    };
    map_list_outer.addEventListener('touchstart', function(e){
        var touchobj = e.changedTouches[0]; // reference first touch point (ie: first finger)
        starty = parseInt(touchobj.clientY); // get y position of touch point relative to left edge of browser
        if(pinMap.isListOpen && map_outer_list.scrollTop === 0) {
            drag_down = true;
            map_drag_up.style.opacity = 0;
            map_drag_up.style.display = "block";
        }else {
            drag_down = false;
        }

        drag_up = !pinMap.isListOpen;
    }, false);
    map_list_outer.addEventListener('touchmove', function(e){
        var touchobj = e.changedTouches[0]; // reference first touch point for this event
        curentdist = parseInt(touchobj.clientY) - starty;
        if(drag_down) {
            if(curentdist>0) {
                e.preventDefault();
                if(Math.abs(curentdist)>window.innerHeight*0.05) {
                    if(Math.abs(curentdist)< ((window.innerHeight*.45)-32) ) {
                        map_list.style.bottom = "-"+Math.abs(curentdist)+"px";
                        map_list_content.style.marginTop = curentdist * 0.1 + "px";
                        map_list_content.style.opacity = Number((((window.innerHeight*.45)-32))-Math.abs(curentdist)).map( 0 , ((window.innerHeight*.45)-32) , 0 , 1 ) ;
                        map_drag_up.style.opacity = Number((((window.innerHeight*.45)-32))-Math.abs(curentdist)).map( 0 , ((window.innerHeight*.45)-32) , 1 , 0 );

                        map_min_placering.style.bottom = (window.innerHeight * .45 + 20)-Math.abs(curentdist) + "px";

                    }else {
                        map_list.style.bottom =  "-"+(((window.innerHeight*.45)-32))+"px";
                        map_list_content.style.opacity = 0;

                        map_min_placering.style.bottom = "53px";

                    }
                }
            }else {
                map_list.style.bottom = "0px";
                map_list_content.style.opacity = 1;
                map_list_content.style.marginTop = 0;

                map_min_placering.style.bottom = window.innerHeight * .45 + 20 + "px";

            }
        }
        if(drag_up) {
            e.preventDefault();
            if(curentdist<0) {
                if(Math.abs(curentdist)< ((window.innerHeight*.45)-32) ) {
                    map_list.style.bottom = "-"+((((window.innerHeight*.45)-32))-Math.abs(curentdist))+"px";
                    map_drag_up.style.opacity = Number((((window.innerHeight*.45)-32))-Math.abs(curentdist)).map( 0 , ((window.innerHeight*.45)-32) , 0 , 1 );
                    map_list_content.style.marginTop = ((((window.innerHeight*.45)-32))-Math.abs(curentdist)) * 0.1 + "px";
                    map_list_content.style.opacity = Number((((window.innerHeight*.45)-32))-Math.abs(curentdist)).map( 0 , ((window.innerHeight*.45)-32) , 1 , 0 );
                    map_min_placering.style.bottom = 53+Math.abs(curentdist) + "px";

                }else {
                    map_list.style.bottom = 0;
                    map_list_content.style.opacity = 1;
                    map_list_content.style.marginTop = 0;
                    map_drag_up.style.opacity = 0;
                    map_min_placering.style.bottom = window.innerHeight * .45 + 20 + "px";

                }
            }
        }
    }, false);
    map_list_outer.addEventListener('touchend', function(e){
        if(drag_down) {
            if(Math.abs(curentdist) > (window.innerHeight/6) && curentdist > 0 ) {
                $(map_list).velocity({bottom: "-"+((window.innerHeight *.45)-32)});
                $(map_list_content).velocity({opacity:0, marginTop:((window.innerHeight *.45)-32)*0.1});
                $(map_drag_up).velocity({opacity:1});
                $(map_min_placering).velocity({bottom: 53});
                pinMap.isListOpen = false;
            }else {
                $(map_list).velocity({bottom: 0});
                $(map_list_content).velocity({opacity:1, marginTop:0});
                $(map_min_placering).velocity({bottom:  window.innerHeight * .45 + 20 });
                $(map_drag_up).velocity({opacity:0}, function(){
                    map_drag_up.style.display = "none";
                });
            }
        }
        if(drag_up) {
            if(Math.abs(curentdist) > (window.innerHeight/12) ) {
                $(map_list).velocity({bottom: 0});
                $(map_list_content).velocity({opacity:1, marginTop:0});
                $(map_drag_up).velocity({opacity:0}, function(){
                    map_drag_up.style.display = "none";
                });
                $(map_min_placering).velocity({bottom:  window.innerHeight * .45 + 20 });
                pinMap.isListOpen = true;
            }else {
                $(map_list).velocity({bottom: "-"+ ((window.innerHeight *.45)-32)});
                $(map_list_content).velocity({opacity:0, marginTop:((window.innerHeight *.45)-32)*0.1});
                $(map_drag_up).velocity({opacity:1});
                $(map_min_placering).velocity({bottom: 53});

            }
        }
    }, false);


});

function initilizeEvents() {
    document.addEventListener('deviceready', onDeviceReady, false);
}
function onDeviceReady() {
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
    document.addEventListener("backbutton", onBackKeyDown, false);
}
function onBackKeyDown() {

    if($('#map').is(":visible")) {
        if(pinMap.previewCafe===false) {
            pinMap.closeMap();
        }else {
            pinMap.closePreviewCafe();
        }
        return true;
    }
    if($('#res_map').is(":visible")) {
        resMap.close();
        return true;
    }

    if($('#home').is(":visible") && $('#home').css('paddingBottom') === "550px"){
        ClearSearchInput();
        return true;
    }
    if($('#menu').is(":visible")) {
        if($('#menuBlock').is(":visible")) {
            backBtnSwich('home');
            return true;
        }
        if($('#stampPage').is(":visible")) {
            backBtnSwich('hideStampPage');
            return true;
        }
        if($('#getStampPage').is(":visible")) {
            backBtnSwich('hideGetStampsPage');
            return true;
        }
    }
    navigator.app.exitApp();
}
function onResume() {

    console.log('resume');
    if($('#map').is(":visible")){
        pinMap.wathId = navigator.geolocation.watchPosition(
            pinMap.showPosition
            ,pinMap.gps_fail, {
                'enableHighAccuracy': true,
                'maximumAge': 15000,
                'timeout': 14000
            });
    }
    if($('#res_map').is(":visible")){
        pinMap.wathId = navigator.geolocation.watchPosition(
            resMap.showPosition
            ,resMap.gps_fail, {
                'enableHighAccuracy': true,
                'maximumAge': 15000,
                'timeout': 14000
            });
    }

    if(startRequestAnimationFrameOnResume) {
        startRequestAnimationFrameOnResume = false;
        startRequestAnimationFrame();
    }
}
function onPause() {

    console.log('pause');
    if(pinMap.wathId) {
        navigator.geolocation.clearWatch(pinMap.wathId);
    }

    if(requestAnimationFrameContinue) {
        startRequestAnimationFrameOnResume = true;
        requestAnimationFrameContinue = false;
    }
}