import { BrandingAsset, StorefrontHeroText } from '../backend';
import Model3DViewer from './Model3DViewer';

interface StorefrontHeroMediaProps {
  heroMedia: BrandingAsset | null;
  heroText: StorefrontHeroText | null;
}

export default function StorefrontHeroMedia({ heroMedia, heroText }: StorefrontHeroMediaProps) {
  const isModel3D = heroMedia?.mediaKind.__kind__ === 'model3d';
  const heroUrl = heroMedia?.blob.getDirectURL() || '/assets/generated/hero-bg.dim_1600x600.png';

  // Resolve hero text with fallback to defaults
  const defaultTitle = 'Handcrafted Ocarinas';
  const defaultSubtitle = 'Discover unique, beautifully crafted ocarinas perfect for collectors and musicians';
  
  let title = defaultTitle;
  let subtitle = defaultSubtitle;
  
  if (heroText?.__kind__ === 'custom') {
    title = heroText.custom.title || defaultTitle;
    subtitle = heroText.custom.subtitle || defaultSubtitle;
  }

  if (isModel3D) {
    return (
      <div className="relative h-96 bg-muted">
        <Model3DViewer modelUrl={heroUrl} />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/40 to-background/60 flex items-center justify-center z-10">
          <div className="text-center space-y-2 px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground drop-shadow-lg">
              {title}
            </h2>
            <p className="text-lg text-foreground/90 max-w-2xl mx-auto drop-shadow">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative h-64 bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${heroUrl})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/80" />
      <div className="relative z-10 text-center space-y-2 px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground">
          {title}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
