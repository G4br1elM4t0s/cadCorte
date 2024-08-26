import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const RectangleScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [medida, setMedida] = useState<number | null>(null);
  const [eixo, setEixo] = useState<string | null>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth - 200, window.innerHeight);
    mountRef.current!.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Adicionando GridHelper
    const gridHelper = new THREE.GridHelper(100, 100);
    scene.add(gridHelper);

    // Adicionando AxesHelper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Dimensões do retângulo 3D (caixa)
    const width = 8.95;
    const height = 0.58;
    const depth = 4.0;

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
    const box = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), faceMaterials);

    // Posicionando o retângulo no centro da cena
    // box.position.set(width / 2, height / 2, depth / 2);
    box.position.set(0, 0, 0);

    // Array para armazenar as esferas (vértices)
    const spheres: THREE.Mesh[] = [];

    // Adicionando esferas azuis nos vértices como filhos da caixa
    const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

    const vertices = [
      [-width / 2, -height / 2, -depth / 2],
      [width / 2, -height / 2, -depth / 2],
      [-width / 2, height / 2, -depth / 2],
      [width / 2, height / 2, -depth / 2],
      [-width / 2, -height / 2, depth / 2],
      [width / 2, -height / 2, depth / 2],
      [-width / 2, height / 2, depth / 2],
      [width / 2, height / 2, depth / 2],
    ];

    vertices.forEach(vertex => {
      const sphere = new THREE.Mesh(sphereGeometry.clone(), sphereMaterial.clone());
      sphere.position.set(vertex[0], vertex[1], vertex[2]);
      sphere.position.add(box.position);  // Ajuste para garantir que as esferas estejam em relação ao centro da cena
      spheres.push(sphere); // Armazenando a esfera para detecção de interseção
      scene.add(sphere);    // Adicionando a esfera diretamente à cena
    });

    scene.add(box);

    // Raycaster e vetor do mouse para detecção de interseção
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let intersectedSphere: THREE.Mesh | null = null;
    const selectedSpheres: THREE.Mesh[] = [];

    // Função para detectar o movimento do mouse
    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(spheres);

      if (intersects.length > 0) {
        const intersect = intersects[0].object as THREE.Mesh;

        if (intersectedSphere !== intersect) {
          // Resetar a cor da esfera anterior (se não estiver selecionada)
          if (intersectedSphere && !selectedSpheres.includes(intersectedSphere)) {
            intersectedSphere.material.color.set(0x0000ff);
          }

          // Alterar a cor da esfera atual
          intersectedSphere = intersect;
          if (!selectedSpheres.includes(intersect)) {
            intersect.material.color.set(0xffff00);
          }
        }
      } else {
        // Resetar a cor da esfera anterior (se não estiver selecionada)
        if (intersectedSphere && !selectedSpheres.includes(intersectedSphere)) {
          intersectedSphere.material.color.set(0x0000ff);
        }
        intersectedSphere = null;
      }
    };

    // Função para detectar cliques do mouse
    const onClick = () => {
      if (intersectedSphere !== null) {
        if (selectedSpheres.includes(intersectedSphere)) {
          // Se a esfera já está selecionada, desmarcá-la
          intersectedSphere.material.color.set(0x0000ff);
          selectedSpheres.splice(selectedSpheres.indexOf(intersectedSphere), 1);
        } else {
          // Se o máximo de 4 esferas já está selecionado, desmarcar a mais antiga
          if (selectedSpheres.length >= 4) {
            const oldestSphere = selectedSpheres.shift()!;
            oldestSphere.material.color.set(0x0000ff);
          }

          // Selecionar a nova esfera
          selectedSpheres.push(intersectedSphere);
          intersectedSphere.material.color.set(0xff0000); // Cor permanente ao clicar
        }

        // Se 4 esferas estão selecionadas, calcular e mostrar a maior distância ao longo de qualquer eixo
        if (selectedSpheres.length === 4) {
          const p1 = selectedSpheres[0].position;
          const p2 = selectedSpheres[1].position;
          const p3 = selectedSpheres[2].position;
          const p4 = selectedSpheres[3].position;
          let newBoxGeometry;

          // Calculate the centroid of the selected vertices
          const centroid = new THREE.Vector3();
          selectedSpheres.forEach(sphere => centroid.add(sphere.position));
          centroid.divideScalar(4);
        
          // Calculate the vectors defining the plane
          const v1 = new THREE.Vector3().subVectors(p2, p1);
          const v2 = new THREE.Vector3().subVectors(p3, p1);
          const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
        
          // Determine which face is selected based on the normal and centroid
          let face = '';
        
  
        
          // The rest of your existing logic (creating and positioning the new box)
          const xDistance = Math.max(
            ...selectedSpheres.map((sphere, i) => selectedSpheres.slice(i + 1).map(other => Math.abs(sphere.position.x - other.position.x)))
            .flat()
          );
          const zDistance = Math.max(
            ...selectedSpheres.map((sphere, i) => selectedSpheres.slice(i + 1).map(other => Math.abs(sphere.position.z - other.position.z)))
            .flat()
          );
        
          if (xDistance >= zDistance) {
            newBoxGeometry = new THREE.BoxGeometry(xDistance, height, 1.5);
          } else {
            newBoxGeometry = new THREE.BoxGeometry(1.5, height, zDistance);
          }
        
          const newBoxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
          const newBox = new THREE.Mesh(newBoxGeometry, newBoxMaterial);
        
          // Position the new box in front of the plane
          const distance = 0.4;
          const newPosition = new THREE.Vector3().addVectors(centroid, normal.multiplyScalar(distance));
          newBox.position.copy(newPosition);
          if (Math.abs(normal.z) > Math.abs(normal.x)) {
            // Dominant axis is Z
            if (normal.z < 0) {
              // rotate the box
              console.log(normal.z)
              newBox.rotation.x = THREE.MathUtils.degToRad(45);
              face = 'Frente';
            } else {
              console.log(normal.z)
              newBox.rotation.x = THREE.MathUtils.degToRad(135);
              face = 'Trás';
            }
          } else {
            // Dominant axis is X
            if (normal.x > 0) {
              face = 'Direita';
            } else {
              face = 'Esquerda';
            }
          }
        
          console.log(`A face selecionada é a: ${face}`);

        
          // Add the new box to the scene
          scene.add(newBox);
        }
         else {
          setMedida(null); // Reseta a medida quando menos de 4 esferas são selecionadas
          setEixo(null);
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

  return (
    <div>
      <div ref={mountRef}></div>
      <div>
        {medida !== null && eixo && (
          <p>
            <strong>{eixo} da seleção:</strong> {medida.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
};

export default RectangleScene;
