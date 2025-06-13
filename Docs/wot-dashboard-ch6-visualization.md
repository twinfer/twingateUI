# W3C WoT Dashboard - Chapter 6: 3D Visualization with IoT-CardboardJS

## IoT-CardboardJS Integration

### Scene Manager Component
```typescript
// features/visualization/SceneManager.tsx
interface SceneManagerProps {
  things: ThingDescription[];
  selectedThingId?: string;
  onThingSelect?: (thingId: string) => void;
  config?: SceneConfig;
}

interface SceneConfig {
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  };
  environment: {
    lighting: 'default' | 'studio' | 'outdoor';
    showGrid: boolean;
    showAxes: boolean;
    backgroundColor: string;
  };
  performance: {
    maxFPS: number;
    enableShadows: boolean;
    antialias: boolean;
    pixelRatio: number;
  };
}
```

### Thing 3D Model Mapper
```typescript
// features/visualization/ThingModelMapper.ts
export class ThingModelMapper {
  private modelCache = new Map<string, Three.Object3D>();
  
  async mapThingToModel(thing: ThingDescription): Promise<ThingModel> {
    // 1. Check for explicit 3D model link
    const modelLink = this.findModelLink(thing);
    if (modelLink) {
      return await this.loadExternalModel(modelLink);
    }
    
    // 2. Map by semantic type
    const semanticType = thing['@type']?.[0];
    if (semanticType) {
      return this.getModelBySemanticType(semanticType);
    }
    
    // 3. Generate procedural model
    return this.generateProceduralModel(thing);
  }
  
  private getModelBySemanticType(type: string): ThingModel {
    const modelMappings = {
      'TemperatureSensor': {
        geometry: 'cylinder',
        color: '#ff6b6b',
        icon: '🌡️'
      },
      'Light': {
        geometry: 'sphere',
        color: '#ffd93d',
        emissive: true
      },
      'Door': {
        geometry: 'box',
        color: '#8b4513',
        animations: ['open', 'close']
      }
    };
    
    return modelMappings[type] || this.getDefaultModel();
  }
}
```

### Real-time Data Binding
```typescript
// features/visualization/DataBinding.tsx
interface DataBindingConfig {
  thingId: string;
  propertyName: string;
  bindingType: 'color' | 'position' | 'scale' | 'rotation' | 'text';
  mapping: ValueMapping;
}

interface ValueMapping {
  source: {
    min: number;
    max: number;
    unit?: string;
  };
  target: {
    min: number | string | [number, number, number];
    max: number | string | [number, number, number];
    interpolation: 'linear' | 'logarithmic' | 'step';
  };
}

// Example: Temperature to color mapping
const tempColorMapping: ValueMapping = {
  source: { min: 0, max: 40, unit: 'celsius' },
  target: {
    min: '#0066cc',  // Blue for cold
    max: '#ff3333',  // Red for hot
    interpolation: 'linear'
  }
};
```

### Interactive Controls
```typescript
// features/visualization/InteractiveControls.tsx
export function useThingInteraction() {
  const raycaster = useRef(new Three.Raycaster());
  const mouse = useRef(new Three.Vector2());
  
  const handleClick = useCallback((event: MouseEvent, camera: Three.Camera, scene: Three.Scene) => {
    // Calculate mouse position
    mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycast to find intersected objects
    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const thingId = intersects[0].object.userData.thingId;
      if (thingId) {
        // Show thing details overlay
        showThingOverlay(thingId);
      }
    }
  }, []);
  
  return { handleClick };
}
```

## Visualization Components

### 3D Dashboard View
```typescript
// features/visualization/Dashboard3D.tsx
interface Dashboard3DProps {
  layout: 'floor-plan' | 'topology' | 'geographic';
  things: ThingDescription[];
  connections?: Connection[];
}

// Layout strategies
const layoutStrategies = {
  'floor-plan': {
    // Position things based on location metadata
    positionThing: (thing: ThingDescription) => {
      const location = thing.location;
      return [location.x, 0, location.y];
    }
  },
  'topology': {
    // Force-directed graph layout
    positionThing: (thing: ThingDescription, index: number, total: number) => {
      const angle = (index / total) * Math.PI * 2;
      const radius = Math.sqrt(total) * 10;
      return [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ];
    }
  }
};
```

### Property Visualization Overlay
```typescript
// features/visualization/PropertyOverlay.tsx
interface PropertyOverlayProps {
  thing: ThingDescription;
  position: { x: number; y: number };
  properties: string[]; // Which properties to show
}

// Overlay features:
// - Real-time value updates
// - Mini charts for trends
// - Quick actions (write property)
// - Unit conversions
// - Alert indicators
```

### Spatial Thing Browser
```typescript
// features/visualization/SpatialBrowser.tsx
interface SpatialBrowserProps {
  onNavigate: (path: string[]) => void;
  currentPath: string[];
}

// Hierarchical navigation
// - Zoom into containers (rooms, buildings)
// - Breadcrumb navigation
// - Minimap overview
// - Search with spatial highlighting
```

## Performance Optimization

### Level of Detail (LOD) System
```typescript
// features/visualization/LODManager.ts
export class LODManager {
  private lodGroups = new Map<string, Three.LOD>();
  
  createLODForThing(thing: ThingDescription): Three.LOD {
    const lod = new Three.LOD();
    
    // High detail (close)
    const highDetail = this.createHighDetailModel(thing);
    lod.addLevel(highDetail, 0);
    
    // Medium detail
    const mediumDetail = this.createMediumDetailModel(thing);
    lod.addLevel(mediumDetail, 50);
    
    // Low detail (far)
    const lowDetail = this.createLowDetailModel(thing);
    lod.addLevel(lowDetail, 200);
    
    // Billboard (very far)
    const billboard = this.createBillboard(thing);
    lod.addLevel(billboard, 500);
    
    return lod;
  }
}
```

### Culling and Instancing
```typescript
// features/visualization/RenderOptimization.ts
export class RenderOptimizer {
  private instancedMeshes = new Map<string, Three.InstancedMesh>();
  
  optimizeScene(scene: Three.Scene, things: ThingDescription[]) {
    // 1. Group similar things for instancing
    const groups = this.groupBySimilarity(things);
    
    // 2. Create instanced meshes
    groups.forEach((group, type) => {
      if (group.length > 5) { // Threshold for instancing
        const instancedMesh = this.createInstancedMesh(type, group);
        scene.add(instancedMesh);
      }
    });
    
    // 3. Enable frustum culling
    scene.traverse((object) => {
      object.frustumCulled = true;
    });
    
    // 4. Optimize render order
    scene.traverse((object) => {
      if (object instanceof Three.Mesh) {
        object.renderOrder = this.calculateRenderOrder(object);
      }
    });
  }
}
```

## AR/VR Support

### WebXR Integration
```typescript
// features/visualization/XRSupport.tsx
export function useXRSupport() {
  const [xrSupported, setXRSupported] = useState(false);
  const [xrSession, setXRSession] = useState<XRSession | null>(null);
  
  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-ar').then(setXRSupported);
    }
  }, []);
  
  const enterXR = async () => {
    if (!xrSupported) return;
    
    const session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test', 'dom-overlay'],
      domOverlay: { root: document.getElementById('xr-overlay') }
    });
    
    setXRSession(session);
  };
  
  return { xrSupported, xrSession, enterXR };
}
```