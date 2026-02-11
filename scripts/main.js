import {
  LoadingScreenPlugin,
  ProgressivePlugin,
  SSAAPlugin,
  ContactShadowGroundPlugin,
  ThreeViewer,
} from 'threepipe';

let viewer;
let model;
let camera;

async function setupViewer() {
  viewer = new ThreeViewer({
    canvas: document.getElementById('web-canvas'),
    msaa: false,
    renderScale: "auto",
    tonemap: true,
    plugins: [
      LoadingScreenPlugin,
      ProgressivePlugin, SSAAPlugin,
      ContactShadowGroundPlugin
    ],
    rgbm: false, // rgbm doesn't support transparent backgrounds
    backgroundColor: null,
  });

  // (Since we clear the background, environment map is not needed)
  //- await viewer.setEnvironmentMap("./assets/autumn forest.hdr");
  model = await viewer.load("./assets/casio g-shock watch v2.glb");
  //+  console.log('Loaded model:', model);
  //+  console.log('Default camera:', viewer.scene.defaultCamera);
  camera = viewer.scene.mainCamera;

  viewer.scene.background = null; // Remove background texture
  viewer.scene.setBackgroundColor(null); // Remove background color
  // Model is offset from centre: move it a bit left
  model.position.x -= 1;
}

setupViewer();

let scrollPosition = 0;
let initialModelPosition = false;
let initialCameraPosition = false;

// Hook into ThreePipe's update loop to apply rotation and lock camera/model position
viewer.addEventListener('postFrame', () => {
  // let scrollPosition = window.scroll.y;
  if (model && viewer) {
    // Store initial positions on first frame
    if (!initialModelPosition) {
      initialModelPosition = {
        x: model.position.x,
        y: model.position.y,
        z: model.position.z
      };
      console.log('Model position stored: ', initialModelPosition);
      
      if (camera) {
        initialCameraPosition = {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z
        };
        //+ console.log('Camera position stored:', initialCameraPosition);
      }
      //+ console.log('Camera object:', viewer.scene.defaultCamera);
    }
    
    // Apply rotation based on scroll
    model.rotation.y = scrollPosition * 0.004;
    
    // Reset model position
    model.position.x = initialModelPosition.x;
    model.position.y = initialModelPosition.y;
    model.position.z = initialModelPosition.z;
    
    // Reset camera position
    if (initialCameraPosition) {
      if (camera) {
        camera.position.x = initialCameraPosition.x;
        camera.position.y = initialCameraPosition.y;
        camera.position.z = initialCameraPosition.z;
      }
    }
  }
});

window.onscroll = function() {
  if(document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      document.querySelector('.back-to-top').style.display = 'block';
  } else {
      document.querySelector('.back-to-top').style.display = 'none';
  }
};

let scrollSpeed = 1.0;

// Add an event listener for the 'wheel' event
document.addEventListener('wheel', function(event) {
  // Prevent default scrolling behavior
  event.preventDefault();

  // Calculate the new scroll position
  let delta = event.deltaY;
  scrollPosition = window.scrollY + (delta * scrollSpeed);

  // Set the new scroll position
  window.scrollTo({
    top: scrollPosition,
    behavior: 'smooth'
  });
},
{ passive: false });

window.addEventListener('hashchange', () => {
  if (window.location.hash === '#top') {
    console.log('The user moved to the top of the page!');
    scrollPosition = 0;
    viewer.setDirty();
  }
});
