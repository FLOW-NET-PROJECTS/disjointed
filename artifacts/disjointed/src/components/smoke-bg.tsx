export function SmokeBg() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(108,178,88,0.18),transparent_42%),linear-gradient(180deg,rgba(14,22,14,0.12),rgba(6,10,7,0.02))]" />
      <div className="absolute -top-20 left-[-10%] h-[24rem] w-[24rem] rounded-full bg-primary/12 blur-[110px] md:h-[32rem] md:w-[32rem]" />
      <div className="absolute bottom-[-8rem] right-[-6%] h-[20rem] w-[20rem] rounded-full bg-primary/8 blur-[100px] md:h-[26rem] md:w-[26rem]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background/35 to-transparent" />
    </div>
  );
}
