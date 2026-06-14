export function enrichRecords(records) {
  return records.map((record, index) => {
    const previousOdo = index > 0 ? records[index - 1].odo : null;
    const distanceKm =
      previousOdo !== null ? record.odo - previousOdo : null;

    const kwhPerKm =
      distanceKm !== null && distanceKm > 0
        ? record.charge_kwh / distanceKm
        : null;

    const kmPerKwh =
      record.charge_kwh > 0 && distanceKm !== null && distanceKm > 0
        ? distanceKm / record.charge_kwh
        : null;

    return {
      ...record,
      distanceKm,
      kwhPerKm,
      kmPerKwh,
    };
  });
}

export function computeSummary(enrichedRecords) {
  const recordsWithDistance = enrichedRecords.filter(
    (record) => record.distanceKm !== null && record.distanceKm > 0,
  );

  const totalKm = recordsWithDistance.reduce(
    (sum, record) => sum + record.distanceKm,
    0,
  );

  const totalKwh = enrichedRecords.reduce(
    (sum, record) => sum + (record.charge_kwh || 0),
    0,
  );

  const totalChargeMinutes = enrichedRecords.reduce(
    (sum, record) => sum + (record.charge_minutes || 0),
    0,
  );

  const avgKwhPerKm =
    totalKm > 0 ? totalKwh / totalKm : null;

  const avgKmPerKwh =
    totalKwh > 0 ? totalKm / totalKwh : null;

  return {
    totalKm,
    totalKwh,
    totalChargeMinutes,
    avgKwhPerKm,
    avgKmPerKwh,
  };
}

export function formatChargeTime(minutes) {
  if (minutes === null || minutes === undefined) {
    return '—';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) {
    return '—';
  }
  return value.toFixed(decimals);
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
