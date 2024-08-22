import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

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

    // Dimensões do retângulo 3D (caixa)
    const width = 8.95;
    const height = 2.58;
    const depth = 1.0; // Adicionando profundidade

    // Criando materiais para cada face
    const faceMaterials = [
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Frente
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Trás
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Topo
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Fundo
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Esquerda
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Direita
    ];

    // Criando a caixa (objeto 3D) com materiais diferentes para cada face
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const box = new THREE.Mesh(geometry, faceMaterials);
    scene.add(box);

    // Raycaster e vetor do mouse para detecção de interseção
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let intersectedFaceIndex: number | null = null;
    const clickedFaces: Set<number> = new Set();

    // Função para detectar o movimento do mouse
    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObject(box);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        const faceIndex = Math.floor(intersect.faceIndex! / 2);

        if (intersectedFaceIndex !== faceIndex && !clickedFaces.has(faceIndex)) {
          // Resetar a cor da face anterior
          if (intersectedFaceIndex !== null && !clickedFaces.has(intersectedFaceIndex)) {
            faceMaterials[intersectedFaceIndex].color.set(0x00ff00);
          }

          // Alterar a cor da face atual
          intersectedFaceIndex = faceIndex;
          if (!clickedFaces.has(faceIndex)) {
            faceMaterials[intersectedFaceIndex].color.set(0xffff00);
          }
        }
      } else {
        if (intersectedFaceIndex !== null && !clickedFaces.has(intersectedFaceIndex)) {
          faceMaterials[intersectedFaceIndex].color.set(0x00ff00);
          intersectedFaceIndex = null;
        }
      }
    };

    // Função para detectar cliques do mouse
    const onClick = () => {
      if (intersectedFaceIndex !== null) {
        if (clickedFaces.has(intersectedFaceIndex)) {
          // Se já está clicado, remover da lista e resetar a cor
          clickedFaces.delete(intersectedFaceIndex);
          faceMaterials[intersectedFaceIndex].color.set(0x00ff00);
        } else {
          // Se não está clicado, adicionar à lista e manter a cor
          clickedFaces.add(intersectedFaceIndex);
          faceMaterials[intersectedFaceIndex].color.set(0xff0000); // Cor permanente ao clicar
        }
      }
    };

    // Adicionando eventos de movimento e clique do mouse
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    // Adicionando vértices (bolinhas)
    const vertexMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const vertexGeometry = new THREE.SphereGeometry(0.1, 16, 16);

    const positionArray = geometry.attributes.position.array;
    const vertices: THREE.Vector3[] = [];

    for (let i = 0; i < positionArray.length; i += 3) {
      const vertex = new THREE.Vector3(positionArray[i], positionArray[i + 1], positionArray[i + 2]);
      vertices.push(vertex);
      const vertexMesh = new THREE.Mesh(vertexGeometry, vertexMaterial);
      vertexMesh.position.copy(vertex);
      scene.add(vertexMesh);
    }

    // Adicionando linhas-guia (edges)
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
    scene.add(edgeLines);

    // Adicionando réguas (medidas)
    const drawRuler = (start: THREE.Vector3, end: THREE.Vector3, label: string) => {
      const midPoint = new THREE.Vector3().lerpVectors(start, end, 0.5);

      const rulerGeometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const rulerLine = new THREE.Line(rulerGeometry, edgeMaterial);
      scene.add(rulerLine);

      const loader = new FontLoader();
      loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
        const textGeometry = new TextGeometry(label, {
          font,
          size: 0.2,
          height: 0.05,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.copy(midPoint);
        scene.add(textMesh);
      });
    };

    // Desenhando as réguas
    drawRuler(vertices[0], vertices[1], `${width.toFixed(2)} m`);
    drawRuler(vertices[1], vertices[5], `${depth.toFixed(2)} m`);
    drawRuler(vertices[1], vertices[2], `${height.toFixed(2)} m`);

    camera.position.z = 15;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current!.removeChild(renderer.domElement);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return <div ref={mountRef}></div>;
};

export default RectangleScene;
