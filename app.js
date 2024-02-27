import * as THREE from "https://cdn.skypack.dev/three@0.133.1";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/loaders/GLTFLoader.js";
import fragment from "./shaders/fragment.glsl.js";
import vertex from "./shaders/vertex.glsl.js";


class Sketch {
    constructor(options) {
        this.time = 0;
        this.container = options.dom;
        //create scene
        this.scene = new THREE.Scene();

        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        //create camera
        this.camera = new THREE.PerspectiveCamera(
            70,
            this.width / this.height,
            0.001,
            1000
        );
  
        this.camera.position.set(0, 0, 1.15);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        this.renderer.setClearColor(0x000000, 1)

        this.container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );

        this.controls.enableZoom = false;
        this.controls.enablePan = false;


        this.resize();
        this.setupResize();
        this.addObjects();
        this.render();

        this.loader = new GLTFLoader();
        this.loader.load("./model/scene-processed.glb", (gltf) => {
            console.log("gltf-model:", gltf);



            const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
            const center = boundingBox.getCenter(new THREE.Vector3());
            const size = boundingBox.getSize(new THREE.Vector3());

            // Calculate the max dimension to uniformly scale the model down
            const maxDimension = Math.max(size.x, size.y, size.z);
            const scale = 0.75/ maxDimension;

            gltf.scene.scale.set(scale, scale, scale);

            // Translate the model so that its center aligns with the origin
            gltf.scene.position.sub(center.multiplyScalar(scale));

            this.scene.add(gltf.scene);

            gltf.scene.traverse(o=>{
              if(o.isMesh){
                o.material = this.material
              }
             })

        });
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        //we are saying the viewport has changed and resize based on viewport
        this.camera.updateProjectionMatrix();
    }

    //creating shaders
    addObjects() {
        this.geometry = new THREE.PlaneBufferGeometry(0.5, 0.5, 50, 50);
        this.material = new THREE.MeshNormalMaterial();

        //this shader material has couple of options
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: {
                    type: "f",
                    value: 0,
                },
                sky: {
                    type: "t",
                    value: new THREE.TextureLoader().load("./img/sky9.jpg")
                },
                resolution: {
                    type: "v4",
                    value: new THREE.Vector4()
                },
                uvRate1: {
                    value: new THREE.Vector2(1, 1)
                }
            },
            side: THREE.DoubleSide,
            fragmentShader: fragment,
            vertexShader: vertex,
            // wireframe: true,
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        // this.scene.add(this.mesh);
    }

    render() {
        this.time += 0.05;
        this.mesh.rotation.x = this.time / 2000;
        this.mesh.rotation.y = this.time / 1000;

        this.material.uniforms.time.value = this.time;

        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }
}

new Sketch({
    dom: document.getElementById("container"),
});
