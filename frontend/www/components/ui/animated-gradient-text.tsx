export default function AnimatedGradientText({ text }: { text: string }) {
    return (
      <span className="inline-flex animate-text-gradient bg-gradient-to-r from-muted via-primary to-muted-foreground bg-[200%_auto] text-sm text-center text-transparent font-medium bg-clip-text">
        {text}
      </span>
    );
  }
  