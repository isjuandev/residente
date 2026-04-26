import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel
}: Readonly<{
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}>) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1A5276]/10 text-[#1A5276]">
        !
      </div>
      <h2 className="mt-4 text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex rounded-md bg-[#1A5276] px-4 py-2 text-sm font-semibold text-white"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
