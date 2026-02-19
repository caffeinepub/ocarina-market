import { useNavigate } from '@tanstack/react-router';

export default function StorefrontPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <div className="relative h-[400px] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground">
            Handcrafted Folk Instruments
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Discover unique creations
          </p>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold">Browse Items</h2>
        </div>

        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Backend functionality is being updated. Items will appear here soon.
          </p>
        </div>
      </div>
    </div>
  );
}
