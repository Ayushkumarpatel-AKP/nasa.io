// src/components/ARVisionButton.tsx
type Props = {
  link: string;
};

export default function ARVisionButton({ link }: Props) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="
        inline-flex items-center justify-center
        px-8 py-3 rounded-full
        bg-cyan-400 text-black font-semibold
        hover:bg-cyan-300 transition-all duration-300
        shadow-lg shadow-cyan-400/30
        hover:shadow-cyan-400/50
        hover:scale-105
      "
    >
      <span className="mr-2">🥽</span>
      Launch AR Vision
    </a>
  );
}
