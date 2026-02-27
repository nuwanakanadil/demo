import { ReactNode } from 'react';
interface AnnotatedSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  annotations?: Array<{
    label: string;
    description: string;
  }>;
}
export function AnnotatedSection({
  title,
  description,
  children,
  annotations
}: AnnotatedSectionProps) {
  return (
    <section className="mb-16">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-lg text-gray-600 leading-relaxed">{description}</p>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
        {children}
      </div>

      {annotations && annotations.length > 0 &&
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {annotations.map((annotation, index) =>
        <div
          key={index}
          className="bg-blue-50 rounded-lg p-4 border border-blue-200">

              <h4 className="font-semibold text-blue-900 mb-1">
                {annotation.label}
              </h4>
              <p className="text-sm text-blue-700">{annotation.description}</p>
            </div>
        )}
        </div>
      }
    </section>);

}
