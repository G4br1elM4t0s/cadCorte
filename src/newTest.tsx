import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const RectangleScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current!.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Adicionando luz à cena
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Dimensões do retângulo
    const width = 8.95;
    const height = 0.58;
    const depth = 8.0;

    // Definindo os pontos da geometria personalizada com corte em 45 graus
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);                // Vértice inferior esquerdo
    shape.lineTo(width + height, 0);           // Vértice inferior direito // esse aplica
    shape.lineTo(width, height);             // Vértice superior direito
    shape.lineTo(0, height);                 // Vértice superior esquerdo // esse aplica...
    shape.lineTo(0,0);         // Vértice onde começa o corte em 45 graus
    shape.lineTo(depth , 0);                  // Vértice inferior esquerdo após o corte
    shape.lineTo(0, 0);                      // Fechar o shape

    const extrudeSettings = {
      depth: depth,
      bevelEnabled: false
    };

    // Criando a geometria extrudada com o corte
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const mesh = new THREE.Mesh(geometry, material);
    // mesh.rotateY(2)
    scene.add(mesh);

    // Ajustar a posição da câmera
    camera.position.set(10, 10, 10);
    camera.lookAt(scene.position);

    // Animação para renderizar a cena
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

export default RectangleScene;
