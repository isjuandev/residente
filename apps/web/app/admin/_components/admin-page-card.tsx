export function AdminPageCard({
  title,
  description,
  children
}: Readonly<{
  title: string;
  description: string;
  children?: React.ReactNode;
}>) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-[#1A5276]">{title}</h2>
      <p className="mt-2 max-w-3xl text-slate-600">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
