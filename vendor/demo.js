"use strict";
let THREECAMERA = null;
let DATA;
let INFOBOX;
// callback: launched if a face is detected or lost
function detect_callback(isDetected) {
  if (isDetected) {
    console.log('INFO in detect_callback(): DETECTED');
  } else {
    console.log('INFO in detect_callback(): LOST');
  }
}
// build the 3D. called once when Jeeliz Face Filter is OK
function init_threeScene(spec) {
  const threeStuffs = THREE.JeelizHelper.init(spec, detect_callback);

  // Add our face model:
  const loader = new THREE.BufferGeometryLoader();

  loader.load(
    './models/face_models/face.json',
    (geometry) => {
      const mat = new THREE.MeshBasicMaterial({
        // DEBUG: uncomment color, comment map and alphaMap
        map: new THREE.TextureLoader().load('./models/face_models/texture-image.png'),
        alphaMap: new THREE.TextureLoader().load('./models/face_models/alpha_map_256.png'),
        transparent: true,
        opacity: 0.6
      });

      const faceMesh = new THREE.Mesh(geometry, mat);
      faceMesh.position.y += 0.15;
      faceMesh.position.z -= 0.25;

      addDragEventListener(faceMesh);

      threeStuffs.faceObject.add(faceMesh);
    }
  )

  // We load the font that we'll use to display 3D text:
  const fontLoader = new THREE.FontLoader();
  const TEXT = DATA.method + ' ' + DATA.distance + 'km!';
  fontLoader.load(
    './fonts/helvetiker_regular.typeface.json',
    (font) => {
      const textGeometry = new THREE.TextGeometry(TEXT, {
        font: font,
        size: 0.25,
        height: 0.1,
        curveSegments: 12,
      });

      const textMesh = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({
        color: 0xd12826
      }));
      
      textMesh.rotation.y = 3;
      textMesh.rotation.z = 0.3;
      textMesh.position.x += 0.8;
      textMesh.position.y += 1;
      threeStuffs.faceObject.add(textMesh);
    }
  );

  // CREATE THE VIDEO BACKGROUND
  function create_mat2d(threeTexture, isTransparent){ //MT216 : we put the creation of the video material in a func because we will also use it for the frame
    return new THREE.RawShaderMaterial({
      depthWrite: false,
      depthTest: false,
      transparent: isTransparent,
      vertexShader: "attribute vec2 position;\n\
        varying vec2 vUV;\n\
        void main(void){\n\
          gl_Position=vec4(position, 0., 1.);\n\
          vUV=0.5+0.5*position;\n\
        }",
      fragmentShader: "precision lowp float;\n\
        uniform sampler2D samplerVideo;\n\
        varying vec2 vUV;\n\
        void main(void){\n\
          gl_FragColor=texture2D(samplerVideo, vUV);\n\
        }",
       uniforms:{
        samplerVideo: { value: threeTexture }
       }
    });
  }

  //MT216 : create the frame. We reuse the geometry of the video
  const calqueMesh = new THREE.Mesh(threeStuffs.videoMesh.geometry,  create_mat2d(new THREE.TextureLoader().load('./images/frame.png'), true))
  calqueMesh.renderOrder = 999; // render last
  calqueMesh.frustumCulled = false;
  threeStuffs.scene.add(calqueMesh);

  // CREATE THE CAMERA
  THREECAMERA = THREE.JeelizHelper.create_camera();
} // end init_threeScene()

// Entry point, launched by body.onload():
function main() {
  INFOBOX = document.getElementById('infoBox');
  DATA = JSON.parse(localStorage.getItem('data'));
  console.log(DATA)
  if(!DATA || !DATA.distance) {
    window.open('/index.html')
  }
  JeelizResizer.size_canvas({
    canvasId: 'jeeFaceFilterCanvas',
    callback: function(isError, bestVideoSettings){
      init_faceFilter(bestVideoSettings);
    }
  });
}

function init_faceFilter(videoSettings){
  JEEFACEFILTERAPI.init({
    canvasId: 'jeeFaceFilterCanvas',
    NNCpath: './dist/', // path of NNC.json file
    videoSettings: videoSettings,
    callbackReady: function (errCode, spec) {
      if (errCode) {
        console.log('AN ERROR HAPPENS. SORRY BRO :( . ERR =', errCode);
        return;
      }
      // console.log('INFO: JEEFACEFILTERAPI IS READY');
      init_threeScene(spec);
    }, // end callbackReady()

    // called at each render iteration (drawing loop)
    callbackTrack: function (detectState) {
      THREE.JeelizHelper.render(detectState, THREECAMERA);
    } // end callbackTrack()
  }); // end JEEFACEFILTERAPI.init call
} // end main()