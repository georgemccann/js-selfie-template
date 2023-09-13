var dwn = document.getElementById('btndownload');
var offScreenCanvas;
var canvas;
setTimeout(function(){
  dwn.classList.remove('hidden');
}, 1200);
dwn.onclick = function(){
  download();
}
function download() {
  swapIcon('./images/process.svg', dwn);
  dwn.setAttribute('disabled', '');
  canvas = document.getElementById('jeeFaceFilterCanvas')
  const base64 = canvas.toDataURL("image/png;base64");
  flipHandler(base64, async function(flipped64){
    const shareImage = await sendImageToS3(flipped64);
    swapIcon('./images/tick.svg', dwn);
    setTimeout(function(){
      
      const photo = document.querySelector('.photo');
       
      photo.classList.remove('hidden'); 
      
      
 

      loadImage(flipped64, ['snap'], photo, img => {
        setUpReload();
        document.getElementById('btndownload').classList.add('hidden');
        setUpShare(shareImage);
        photo.appendChild(img);
        photo.classList.remove('hidden');
        canvas.classList.add('hidden'); // hide canvas?
        swapIcon('./images/camera.svg', dwn);
        dwn.removeAttribute('disabled');
      })
    },5000)
  });
}
function flip(base64Image, cb){
  // create an off-screen canvas
  var org = document.getElementById('jeeFaceFilterCanvas')
  const width = org.getAttribute('width')
  const height = org.getAttribute('height')
  
  // create Image
  var img = new Image();
  img.onload = function() {
    offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.classList.add('hidden')
    offScreenCanvas.setAttribute('id', 'dwn')
    offScreenCanvas.setAttribute('width', width)
    offScreenCanvas.setAttribute('height', height)
    document.body.appendChild(offScreenCanvas)
    offScreenCanvasCtx = offScreenCanvas.getContext('2d');
    offScreenCanvasCtx.translate(width, 0);

    // flip context horizontally
    offScreenCanvasCtx.scale(-1, 1);
    offScreenCanvasCtx.drawImage(img,0,0);  
    return cb(offScreenCanvas.toDataURL("image/png;base64", 100))
  };
  img.src = base64Image;
  img.width = width;
  img.height = height;
}
function flipHandler(base64Image, cb) {
  flip(base64Image, function(flipped64){
    // encode image to data-uri with base64
    var lnk = document.createElement('a'), e;
    lnk.download = 'badge.png';
    lnk.href = flipped64;

    if (document.createEvent) {
      e = document.createEvent("MouseEvents");
      e.initMouseEvent("click", true, true, window,
                      0, 0, 0, 0, 0, false, false, false,
                      false, 0, null);

      lnk.dispatchEvent(e);
    } else if (lnk.fireEvent) {
      lnk.fireEvent("onclick");
    } 
    
    offScreenCanvas.outerHTML = "";
    setTimeout(function(){
      cb(flipped64)
    }, 1000)
  });

}

async function sendImageToS3(image_url){

  return new Promise(function(resolve, reject){
    const url = "https://5sv6mj93tg.execute-api.eu-west-2.amazonaws.com/dev/upload";
    const locationURL = 'https://tackle-africa-selfies.s3.eu-west-2.amazonaws.com/';
    const key = 'tackleafricaselfie-' + Date.now() + '.png';
    const obj = {
      image_url,
      key
    };
    const shareImage = `${locationURL + key}`;
    
    localStorage.setItem('shareImage', shareImage)

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    })
    resolve(shareImage);
  })
  
}

function loadImage(src, classname, target, callback) { 
  let img = document.createElement('img');
  classname.forEach(e => {
    const existing = document.querySelector(`.${e}`);
    if(existing) existing.remove();
    img.classList.add(e);  
  });
  img.src = src;
  img.onload = () => callback(img);
  target.prepend(img);
}

function setUpReload(){
  const reload = document.getElementById('reload')
  reload.addEventListener('click', function(){
    canvas.classList.remove('hidden');
    document.getElementById('btndownload').classList.remove('hidden');
    document.querySelector('.photo').classList.add('hidden');
  }, false)
}

function setUpShare (shareImage){
  let share;
  if(!isMobile || !navigator.share){
    document.querySelector('.st-custom-button').setAttribute('data-url', shareImage)
    document.getElementById('shareThis').classList.remove('superHide');
  } else {
    const share = document.getElementById('shareWebAPI');
    if(share){
      share.classList.remove('superHide');
      defineWebShareAPI(share);
    }
  }
}

function defineWebShareAPI(share){
    share.addEventListener('click', function(){
    const shareImage = localStorage.getItem('shareImage')
    if(!shareImage) shareImage = 'https://racetoafrica.run';
    if (navigator.share && shareImage) {
          navigator.share({
            title: 'Race to Africa',
            text: '#racetoafrica',
            url: shareImage,
          })
          .then(() => {
            console.log('Success')
          })
          .catch((error) => console.log('Error sharing', error));
      } else {
        console.log('Web share not supported')
        alert('Sorry, there was an error calling the Share function on your device :(')
      }
    }, false)
}
function swapIcon(src, target){
  const newIcon = document.createElement("img");
  newIcon.src = src;
  target.replaceChild(newIcon,target.childNodes[0])
}