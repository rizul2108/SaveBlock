import * as THREE from "three";

var score = 0;

var highest = localStorage.getItem("highest");
localStorage.setItem("highest", highest);
var maxScore = 0;
var cubes = [];
var collideMeshList = [];
var id = 0;
var crash = false;
var clock = new THREE.Clock();
var scoreNumber = document.getElementById("score");
var maxScoreNumber = document.getElementById("maxScore");
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(10, 150, 200);
const canvas = renderer.domElement;
// canvas.style.width="90vw";
// canvas.style.height="90vh";
// const axesHelper = new THREE.AxesHelper(100);
// scene.add(axesHelper);

// const controls = new OrbitControls(camera, renderer.domElement);

const points = [];
points.push(new THREE.Vector3(-250, -1, -3000));
points.push(new THREE.Vector3(-300, -1, 350));
const geometry = new THREE.BufferGeometry().setFromPoints(points);

const material = new THREE.LineBasicMaterial({
    color: 0x6699ff,
    linewidth: 5,
    fog: true,
});
const line = new THREE.Line(geometry, material);
scene.add(line);

const points2 = [];
points2.push(new THREE.Vector3(250, -1, -3000));
points2.push(new THREE.Vector3(300, -1, 350));
const geometry2 = new THREE.BufferGeometry().setFromPoints(points2);
const line2 = new THREE.Line(geometry2, material);
scene.add(line2);

const boxGeometry = new THREE.BoxGeometry(50, 25, 60, 5, 5, 5);
const boxMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: true,
});
const sphere = new THREE.Mesh(boxGeometry, boxMaterial);
sphere.position.set(0, 45, 0);
scene.add(sphere);

let cubeB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cubeB.setFromObject(sphere);

renderer.setSize(window.innerWidth - 1, window.innerHeight - 1);
document.body.appendChild(renderer.domElement);
  
function movements() {
    var time = clock.getDelta();
    var moveDistance = 200 * time;
    var rotateAngle = (Math.PI / 2) * time;
    document.onkeydown = function(e) {
        if (e.code === "ArrowLeft") {
            if (sphere.position.x > -250) sphere.position.x -= moveDistance;
            if (camera.position.x > -150) {
                camera.position.x -= moveDistance * 0.6;
                if (camera.rotation.z > (-5 * Math.PI) / 180) {
                    camera.rotation.z -= (0.2 * Math.PI) / 180;
                }
            }
        }
        if (e.code === "ArrowRight") {
            if (sphere.position.x < 250) sphere.position.x += moveDistance;
            if (camera.position.x < 150) {
                camera.position.x += moveDistance * 0.6;
                if (camera.rotation.z < (5 * Math.PI) / 180) {
                    camera.rotation.z += (0.2 * Math.PI) / 180;
                }
            }
        }
        if (e.code === "ArrowUp") {
            if (moveDistance < 21) {
                moveDistance += 3;
            }
        }
        if (e.code === "ArrowDown") {
            if (moveDistance > 3) {
                moveDistance -= 3;
            }
        }
    };
    for (let i = 0; i < cubes.length; i++) {
        
        var cubeVec = new THREE.Vector3();
        var sphvec = new THREE.Vector3();
        cubeB.getSize(sphvec);
   
        collideMeshList[i].getSize(cubeVec);
        var c = (cubeVec.x + sphvec.x) / 2;
        if (sphere.position.distanceTo(cubes[i].position)<c) {
            crash = true;
            break;
        }
        crash = false;
    }
   
    if (crash) {
        score -= 5;
        document.getElementById("crash_sound").play();
    }

    if (Math.random() < 0.03 && cubes.length < 30) {
        makeRandomCube();
    }
    for (i = 0; i < cubes.length; i++) {
        if (cubes[i].position.z > camera.position.z) {
            scene.remove(cubes[i]);
            cubes.splice(i, 1);
            collideMeshList.splice(i, 1);
        } else {
            cubes[i].position.z += 5;
        }
    }

    score += 0.2;
    scoreNumber.innerText = "Score:" + Math.floor(score);
    if (maxScore < score) {
        maxScore = Math.floor(score);
    }
    maxScoreNumber.innerText = "Max Score:" + Math.floor(maxScore);
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function makeRandomCube() {
    var a = 1 * 50,
        b = getRandomInt(1, 3) * 50,
        c = 1 * 50;
    var geometry = new THREE.BoxGeometry(a, b, c);
    var material = new THREE.MeshBasicMaterial({
        color: "red",
    });
    var object = new THREE.Mesh(geometry, material);
    var ob = new THREE.Box3();
    ob.setFromObject(object);
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
            color: 0xffffff
        })
    );
    scene.add(line);
    line.position.x = getRandom(-250, 250);
    line.position.y = 1 + b / 2;
    line.position.z = getRandom(-800, -1200);
    cubes.push(line);
    collideMeshList.push(ob);
}
// makeRandomCube();
function animate() {
    requestAnimationFrame(animate);
    if (score >= 0) {
        movements();
    } else {
        const finalDis = document.getElementById("finalScore");
        finalDis.style.display = "block";
        if (maxScore > highest) {
            highest = maxScore;
            localStorage.setItem("highest", highest);
        }
        finalDis.innerHTML = ` Game Over<br>
        Your Final Score is ${maxScore}<br>Your Highest Score till now is ${highest}<br>Press "R" key to Restart the Game`;
        maxScoreNumber.style.display = "none";
        scoreNumber.style.display = "none";
        canvas.style.display = "none";
        document.onkeydown = function(e) {
            if (e.code === "KeyR") {
                window.location.reload();
            }
        };
    }
    renderer.render(scene, camera);
}
animate();