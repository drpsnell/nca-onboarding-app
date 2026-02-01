import Link from "next/link";

export type CollectionDef = {
  title: string;
  subtitle: string;
  itemCount: number;
  href: string;
  gradient: string; // Tailwind gradient classes
};

export default function CollectionCard({ collection }: { collection: CollectionDef }) {
  return (
    <Link
      href={collection.href}
      className="col-span-6 sm:col-span-3 rounded-xl overflow-hidden relative group"
    >
      <div className={`${collection.gradient} p-5 min-h-[120px] flex flex-col justify-end`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
        <div className="relative z-10">
          <div className="text-white/70 text-xs mb-1">{collection.subtitle}</div>
          <h3 className="text-white font-semibold text-lg leading-tight">{collection.title}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-white/60 text-xs">{collection.itemCount} items</span>
            <span className="text-white text-xs font-medium px-2 py-0.5 rounded bg-white/20 group-hover:bg-white/30 transition-colors">
              View Collection
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
