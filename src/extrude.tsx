// src/App.tsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const App: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Cena, câmera e renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Criando a BoxGeometry
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: false,
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    scene.add(box);

    // Definir a forma da geometria extrudada (um retângulo ao lado da caixa)
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); // ponto inicial (esquerda inferior)
    shape.lineTo(0.2, 0); // linha horizontal (largura)
    shape.lineTo(0.2, 2); // linha vertical (altura igual à caixa)
    shape.lineTo(0, 2); // linha de volta para o ponto inicial
    shape.lineTo(0, 0); // fechar a forma

    // Criar uma geometria extrudada da shape
    const extrudeSettings = {
      depth: 0.2, // profundidade da extrusion
      bevelEnabled: false, // sem bordas chanfradas
    };
    const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const shapeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: false,
    });
    const shapeMesh = new THREE.Mesh(extrudeGeometry, shapeMaterial);

    // Posicionar a shape ao lado da caixa (na borda esquerda inferior)
    shapeMesh.position.set(-1.1, -1, 0); // Ajuste a posição com base na geometria da caixa

    // Adicionar a shape à cena
    scene.add(shapeMesh);

    camera.position.z = 5;

    // Animação
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup quando o componente for desmontado
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} />;
};

export default App;
