export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 max-w-[80px] bg-zinc-800/60 rounded-2xl rounded-tl-sm">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce"
          style={{ animationDelay: `${delay}ms`, animationDuration: '900ms' }}
        />
      ))}
    </div>
  );
}
