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

    // Dimensões do retângulo 3D (caixa)
    const width = 8.95;
    const height = 2.58;
    const depth = 1.0;

    // Criando a caixa (objeto 3D)
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false });
    const box = new THREE.Mesh(geometry, material);
    scene.add(box);

    // Criando as arestas do objeto 3D
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    scene.add(edges);

    // Raycaster e vetor do mouse para detecção de interseção
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let intersectedEdgeIndex: number | null = null;
    const clickedEdges: Set<number> = new Set();

    // Função para detectar o movimento do mouse
    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObject(edges);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        const edgeIndex = intersect.index;

        if (intersectedEdgeIndex !== edgeIndex && !clickedEdges.has(edgeIndex!)) {
          // Resetar a cor da aresta anterior
          if (intersectedEdgeIndex !== null && !clickedEdges.has(intersectedEdgeIndex)) {
            edgesMaterial.color.set(0x000000);
          }

          // Alterar a cor da aresta atual
          intersectedEdgeIndex = edgeIndex;
          if (!clickedEdges.has(edgeIndex!)) {
            edgesMaterial.color.set(0xffff00);
          }
        }
      } else {
        if (intersectedEdgeIndex !== null && !clickedEdges.has(intersectedEdgeIndex)) {
          edgesMaterial.color.set(0x000000);
          intersectedEdgeIndex = null;
        }
      }
    };

    // Função para detectar cliques do mouse
    const onClick = () => {
      if (intersectedEdgeIndex !== null) {
        if (clickedEdges.has(intersectedEdgeIndex)) {
          // Se já está clicado, remover da lista e resetar a cor
          clickedEdges.delete(intersectedEdgeIndex);
          edgesMaterial.color.set(0x000000);
        } else {
          // Se não está clicado, adicionar à lista e manter a cor
          clickedEdges.add(intersectedEdgeIndex);
          edgesMaterial.color.set(0xff0000); // Cor permanente ao clicar
        }
      }
    };

    // Adicionando eventos de movimento e clique do mouse
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

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
