import Navigation from '../Navigation';

export default function NavigationExample() {
  return (
    <div className="h-screen bg-gradient-to-b from-primary/20 to-background">
      <Navigation transparent={true} />
      <div className="pt-32 px-8 text-center">
        <p className="text-muted-foreground">Scroll to see navigation change. Try the language selector!</p>
      </div>
    </div>
  );
}
