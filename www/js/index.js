//SET GLOBALS

//Offline
//var sAPIURL = 'http://localhost/MyLocalMenu/API/api.php';

//Online
var sAPIURL = 'http://mylocalcafe.dk/API/api.php';

window.onload = function(){
    CheckInternetConnection();
    makeFavorits();
    CheckForsCustomerId();
    moveScrollerHead();
    
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
       $(".clear").hide();
       $("#home").css("padding-bottom","550px");
   }
   if($('#FindCafe').val().length === 1) {
       $(".clear").show();
   }
   if($('#FindCafe').val().length >= 3) {
       
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
                 }
             });
             
      }
       
   }
}

//********* Detech scroll for Autocomplete *******//

$(window).scroll(function()
{
    if($(window).scrollTop() == $(document).height() - $(window).height())
    {
        //Run autocomplete 
        AutocompleteCafename();
    }
});

//********* end *********//

function SearchInputUp() {
      var height = $(".logo_home").outerHeight();
      $("#favoriteWrapper").velocity("fadeOut", 100 );
      $(".logo_home").velocity({ "margin-top" : -height+"px" }, 500, "easeOutCubic");
      $("#home").css("padding-bottom","550px");
      $(".clear").show();
}
function SearchInputDown() {
    if($('#FindCafe').val().length === 0) {
       $("#favoriteWrapper").velocity("fadeIn", 100 );
       $(".logo_home").velocity({ "margin-top" : 0 }, 500, "easeOutCubic");
       $("#home").css("padding-bottom","0px");
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
    var scrollTop = $("#menu").scrollTop();
    if( scrollTop >= 150 ){
        $("#menu").animate({ scrollTop: 0 }, 400);
    }
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


function editFavorits(){
  if( $(".deleteFavorite").length > 0 ){
    $(".deleteFavorite").remove();
    $(".favoriteWrapper .ui-btn").each(function(i){
      var id = $(this).attr('id');
      $(this).attr("onclick","GetMenucard('"+id+"',2);");
      $(".editFavorits").removeClass("color");
      $(".newMgs").show();
    });
  }
  else{
        $(".favoriteWrapper .ui-btn").each(function(i){
        $(this).append('<div class="deleteFavorite" onclick="FavoritDelete(this);"> <i class="fa fa-trash-o"></i></div>');
        $(this).removeAttr("onclick");
        $(this).attr("onclick","editFavoritsAlert();");
        $(".newMgs").hide();
        $(".editFavorits").addClass("color");
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

                    $('.headTitle h1').html(result.sRestuarentName);
                    $('#sRestuarentAddressHead').html(result.sRestuarentAddress);
                    $('#sRestuarentZipcodeAndCityHead').html(result.iRestuarentInfoZipcode+', '+result.sRestuarentInfoCity);

                    //******** INFO ********//
                    
                    //Clear the openinghours
                    document.getElementById('OpeningHours').innerHTML = '';
                    
                    var sRestuarentPhone = result.sRestuarentPhone;
                    var sRestuarentPhoneFormat = sRestuarentPhone.substring(0, 2)+' '+sRestuarentPhone.substring(2, 4)+' '+sRestuarentPhone.substring(4, 6)+' '+sRestuarentPhone.substring(6, 8);
                    
                    $('.PhoneNumber a').attr('href','tel:'+sRestuarentPhone+'').html(sRestuarentPhoneFormat);

                    $.each(result.aMenucardOpeningHours, function(key,value){

                            if(value.iClosed === '0'){
                                OpeningHours += '<h1>'+value.sDayName+'</h1><h2>'+value.iTimeFrom+' - '+value.iTimeTo+'</h2><br>';
                            }else if(value.iClosed === '1'){
                               OpeningHours += '<h1>'+value.sDayName+'</h1><h2>Lukket</h2><br>';
                            }
                    }); 
                    //Append the result
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
                    }
                    else {
                      $(".menuheader").css("height","0px");
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
                    
                    //Get user stamps
                    var iStamps = localStorage.getItem(sSerialNumberCaps+".stamps");
                    //Calculate stamps left
                    var iFreeItems = Math.floor(iStamps / result.oStampcard.iStampcardMaxStamps);
                    var iStampsLeft = iStamps - ( iFreeItems * result.oStampcard.iStampcardMaxStamps); 
                    var sStampcardText = result.oStampcard.sStampcardText;
                    localStorage.setItem(sSerialNumberCaps+".sStampcardText", sStampcardText);
                    if(iStampsLeft === null){iStampsLeft = 0;}                     
                    
                    $('#makeStampPageBtn').attr('onclick','ShowStampPage(\''+sSerialNumberCaps+'\','+iStamps+','+result.oStampcard.iStampcardMaxStamps+');');
                    $('#stampTotal p').html(iStampsLeft);


                    //********** MENU *********//
                    
                    //Remove all ul in #menublock
                    $('#menuBlock ul').remove();
                    
                    var menucategory = '';
                    var menucategorylastpart = '';
                    $.each(result.aMenucardCategory, function(key,value){
                        
                             menucategory += '<ul class="MenucardCategoryGroup'+key+'"><li class="dishHeadline" onclick="MenucardItemsToggle('+key+');">'+value.sMenucardCategoryName+'<p>'+value.sMenucardCategoryDescription+'</p><img src="img/down_arrow.svg"></li>';
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

function CheckIfDOMLoaded(){
    //Check if DOM is done loading
    var checkDOM = setTimeout(function(){
        if($('.infoBlock p').html() !== ''){
            $(".getmenuLoaderDiv").hide();
            makeheaderGallery();
            $("#menu").show();
            clearTimeout(checkDOM);
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
         $("#favoriteWrapper").append("<h6>Stamsteder:</h6>");
         $("#favoriteWrapper").append('<a id="'+iMenucardSerialNumber+'" class="ui-btn" onclick="GetMenucard(\''+iMenucardSerialNumber+'\',2);"><h1>'+sRestuarentName+'</h1><p>'+sRestuarentAddress+'</p></a>');


      }
                          
      // make favorit block
      if($("#favoriteWrapper").html() === ''){
          $("#favoriteWrapper").append("<h6>Stamsteder:</h6>");
      } 
}

function makeheaderGallery() {
  var mySwiper = new Swiper('.swiper-container',{
                pagination: '.pagination',
                loop:true,
                grabCursor: true,
                paginationClickable: true
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
                                  
                                  var freeItemsString = '';
                                  for (var i = 1; i <= iFreeItems; i++){
                                      freeItemsString += "<div class='stampCircleIcon' onclick='ChooseStampCircle(this);'><p>"+i+"</p></div>";      
                                  }
                                  $("#FreeItemsBlock").append(freeItemsString);

                                  $("#FreeItemsBlock .stampCircleIcon").hide().velocity("transition.slideUpIn", { display:"inline-block", duration: 800 });
                                  if( iFreeItems > 0 ){
                                      $("#FreeItemsBlock").prepend("<h3 class='textuse'>brug:</h3>");
                                  }                          
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
        showHomePage();
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
      $(".backBtn").attr("onclick","backBtnSwich('hideStampPage');").addClass("rotate270");
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

  if(sFunction === 1){
      
        //Show the keypad for get stamp
        $("#stampPage").velocity("transition.shrinkOut", 400, function(){

          $("#stampPage").hide();         
          $(".backBtn").attr("onclick","backBtnSwich('hideGetStampsPage');").removeClass("rotate270");
          
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
          $(".backBtn").attr("onclick","backBtnSwich('hideGetStampsPage');").removeClass("rotate270");

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
                 $(".backBtn").attr("onclick","backBtnSwich('hideStampPage');");
                 $(".backBtn").addClass("rotate270");
                 
                 // opdater antal stempler i localStorage
                 var stamps = localStorage.getItem(iMenucardSerialNumber+".stamps");
                 var stamps = parseInt(stamps) - parseInt(iNumberOfStamps);
                 localStorage.setItem(iMenucardSerialNumber+".stamps",stamps);
                 
                 // animation
                 $("#getStampPage").html("<h1 style='padding-top: 50%;'>Sådan!</h1>");
                 $("#getStampPage").hide().velocity("transition.slideDownBigIn", 300);
                 setTimeout(function(){
                    $("#getStampPage").hide().velocity("transition.slideDownBigOut", 300, function() {


                          $(".inputGetStampwrapper").remove();
                           $("#getStampPage").velocity("transition.slideDownBigOut", 300, function() {

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
                          });

                }, 800);
                
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
                        
                        //Remove old password
                        $('.inputGetStamp').html('');
                        
                        //Opdater antal stempler i localStorage
                        var stamps = localStorage.getItem(iMenucardSerialNumber+".stamps");
                        console.log('stamps: '+stamps);
                        if( stamps === null ) { var stamps = 0; }
                        var stamps = parseInt(stamps) + parseInt(numbersOfStamps);
                        localStorage.setItem(iMenucardSerialNumber+".stamps",stamps);

                        $(".backBtn").attr("onclick","backBtnSwich('hideStampPage');").addClass("rotate270");;

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
                                     $('#makeStampPageBtn').attr('onclick','makeStampPage(\''+iMenucardSerialNumber+'\','+stamps+','+iStampsForFree+')');
                                 
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
            height = height ;
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