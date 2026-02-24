import { ReactNode } from 'react';
interface StateComparisonProps {
  beforeLabel: string;
  afterLabel: string;
  beforeContent: ReactNode;
  afterContent: ReactNode;
}
export function StateComparison({
  beforeLabel,
  afterLabel,
  beforeContent,
  afterContent
}: StateComparisonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <div className="bg-gray-100 rounded-lg px-4 py-2 mb-4 inline-block">
          <p className="text-sm font-semibold text-gray-700">{beforeLabel}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
          {beforeContent}
        </div>
      </div>

      <div>
        <div className="bg-blue-100 rounded-lg px-4 py-2 mb-4 inline-block">
          <p className="text-sm font-semibold text-blue-700">{afterLabel}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300">
          {afterContent}
        </div>
      </div>
    </div>);

}
