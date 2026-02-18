import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { Loader2, AlertCircle } from 'lucide-react';

interface Model3DViewerProps {
  modelUrl: string;
}

function Model3DScene({ modelUrl }: { modelUrl: string }) {
  const [error, setError] = useState<string | null>(null);

  try {
    const obj = useLoader(OBJLoader, modelUrl, undefined, (err) => {
      console.error('Error loading 3D model:', err);
      setError('Failed to load 3D model');
    });

    if (error) {
      return null;
    }

    return <primitive object={obj} scale={1} />;
  } catch (err) {
    console.error('Error in Model3DScene:', err);
    return null;
  }
}

export default function Model3DViewer({ modelUrl }: Model3DViewerProps) {
  const [loadError, setLoadError] = useState(false);

  return (
    <div className="w-full h-full relative">
      {loadError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center space-y-2 px-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">
              Unable to load 3D model preview
            </p>
          </div>
        </div>
      ) : (
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={10}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
          <Suspense 
            fallback={
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#888" wireframe />
              </mesh>
            }
          >
            <Model3DScene modelUrl={modelUrl} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
