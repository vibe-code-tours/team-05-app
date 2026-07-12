'use client';

interface ResultsCountProps {
  start: number;
  end: number;
  total: number;
}

export function ResultsCount({ start, end, total }: ResultsCountProps) {
  return (
    <div className="text-sm text-gray-600">
      Showing{' '}
      <span className="font-medium text-gray-900">
        {start}-{end}
      </span>{' '}
      of{' '}
      <span className="font-medium text-gray-900">{total}</span> products
    </div>
  );
}
