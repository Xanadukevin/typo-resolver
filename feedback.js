var regex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;
var emails = $("body").html().match(regex);
var nl = "%0D%0A";
var recipients = "";
var TEXT_HEIGHT = 60;
var IMG_HEIGHT = 70;
var MARGIN_HEIGHT = 60;

if(emails !== null) {
  recipients = emails;
}else{
  alert("not found any email address, please input some valid email addresses manually.");
}

var subject = "[Typo Resolver] " + document.title + " has some typo";
var body = "Hello" + nl + nl + "Your site has some typo. The attachment has already highlight it." + nl + nl + nl + "from Typo Resolver ( https://chrome.google.com/webstore/detail/kpmhpplainkjokabdbjkfdkohacblnlo ) ";
var arrData = [];
var arrFun = [];
var canvas = document.createElement("canvas");

function scrollToWithTypo(typo, callback){
  var anim = {scrollTop: typo.y};

  $("body").animate(anim, "fast", "swing", function(){
    callback();
  });
}

function screenshot(typo){
  var d = new $.Deferred();

  scrollToWithTypo(typo, function(){
    chrome.runtime.sendMessage({"action": "capture"}, function(response){
      arrData.push({
        "response": response,
        "typo": typo
      });

      d.resolve();
    });
  });

  return d;
}

arrTypo.forEach(function(typo){
  //prevent other pages access current page
  if(typo.url === window.location.href){
    arrFun.push(screenshot(typo));
  }
});

$.when.apply(null, arrFun).then(function(){
  var arrImg = [];

  arrData.forEach(function(data){
    var img = document.createElement("img");

    img.src = data.response;

    data.img = img;

    arrImg.push(img);

    delete data.response;
  });

  imagesLoaded(arrImg, function(instance){
    var height = 0;

    canvas.height = (TEXT_HEIGHT + IMG_HEIGHT + MARGIN_HEIGHT) * arrImg.length;
    canvas.width = $(window).width();

    var ctx = canvas.getContext("2d");

    ctx.font = "40px Arial";

    instance.images.forEach(function(image, i){
      var typo = arrData[i].typo;

      console.log(image.img.width + ", " + image.img.height);

      ctx.fillText(typo.oldText + " => "  + typo.newText, 0, height + (TEXT_HEIGHT - 20));

      height += TEXT_HEIGHT;

      ctx.drawImage(image.img, 0, 0, image.img.width, IMG_HEIGHT, 0, height, image.img.width, IMG_HEIGHT);

      height += (IMG_HEIGHT + MARGIN_HEIGHT);
    });

    window.open(canvas.toDataURL());

    window.open("mailto:" + recipients + "?subject=" + subject + "&body=" + body);
  });
});
