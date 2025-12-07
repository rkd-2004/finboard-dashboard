'use client';

import CardWidget from './CardWidget';
import TableWidget from './TableWidget';
import ChartWidget from './ChartWidget';

const WidgetRenderer = ({ widget }) => {
  switch (widget.displayMode) {
    case 'card':
      return <CardWidget widget={widget} />;
    case 'table':
      return <TableWidget widget={widget} />;
    case 'chart':
      return <ChartWidget widget={widget} />;
    default:
      return <CardWidget widget={widget} />;
  }
};

export default WidgetRenderer;
