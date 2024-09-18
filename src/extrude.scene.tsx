import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const Extrude = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth - 200, window.innerHeight);
    mountRef.current!.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;

    const gridHelper = new THREE.GridHelper(100, 100);
    scene.add(gridHelper);

    camera.position.z = 15;

    // shapes
    const length = 2.5,
      width = 2.5;

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, width);
    shape.lineTo(length, width);
    shape.lineTo(length, 0);
    shape.lineTo(0, 0);

    const extrudeSettings = {
      steps: 2,
      depth: 7,
      bevelEnabled: true,
      bevelThickness: 0,
      bevelSize: 0,
      bevelOffset: 0,
      bevelSegments: 0,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const smallLength = 2.5;
    const smallWidth = 2.5;

    const smallShape = new THREE.Shape();
    smallShape.moveTo(0, 0); // Ponto inferior esquerdo
    smallShape.lineTo(0, smallWidth); // Ponto superior esquerdo
    smallShape.lineTo(smallLength, 0); // Ponto superior direito puxado para baixo (criando o triângulo)
    smallShape.lineTo(0, 0); // Volta para o ponto inicial (fechando o triângulo)

    // Configurar extrusão
    const smallExtrudeSettings = {
      steps: 2,
      depth: width,
      bevelEnabled: false,
    };

    // Criar a geometria e malha
    const smallGeometry = new THREE.ExtrudeGeometry(
      smallShape,
      smallExtrudeSettings
    );
    const smallMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const smallMesh = new THREE.Mesh(smallGeometry, smallMaterial);
    // Ajustar a posição e rotação do smallMesh para que ele funcione como uma rampa
    smallMesh.position.set(
      0, // Centralizado no comprimento da base (eixo X)
      0, // Centralizado na largura (eixo Y)
      0 // Alinhado com o fundo da extrusão no eixo Z
    );

    // Rotacionar para que o triângulo esteja na orientação correta
    smallMesh.rotation.set(0, Math.PI / 2, 0); // Girar no eixo Y para a direita
    mesh.add(smallMesh);

    const wireframeGeometry = new THREE.WireframeGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const wireframe = new THREE.LineSegments(
      wireframeGeometry,
      wireframeMaterial
    );
    mesh.add(wireframe);
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current!.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={mountRef}></div>;
};

export default Extrude;
