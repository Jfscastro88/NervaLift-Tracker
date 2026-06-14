export function calculateMaintenanceStats(records) {
  const totalCost = records.reduce(
    (sum, record) => sum + (Number(record.cost) || 0),
    0,
  );
  const count = records.length;

  const sortedByDate = [...records].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
  const lastRecord = sortedByDate[0] || null;

  return {
    totalCost,
    count,
    lastOdo: lastRecord?.odo ?? null,
    lastDate: lastRecord?.date ?? null,
  };
}

export function calculateAccessoriesStats(records) {
  const totalCost = records.reduce(
    (sum, record) => sum + (Number(record.cost) || 0),
    0,
  );
  const count = records.length;
  const installedCount = records.filter((record) => record.installed).length;
  const notInstalledCount = count - installedCount;

  return {
    totalCost,
    count,
    installedCount,
    notInstalledCount,
  };
}

export function formatCurrency(value) {
  if (value === null || value === undefined) {
    return '—';
  }
  return `€${value.toFixed(2)}`;
}
