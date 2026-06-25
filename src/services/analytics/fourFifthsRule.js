const FOUR_FIFTHS_THRESHOLD = 0.8;

const roundToFour = (value) => Number(value.toFixed(4));

const validateGroup = (group) => {
  if (!group || typeof group !== 'object') {
    throw new Error('Each group must be an object.');
  }

  if (!group.group || typeof group.group !== 'string') {
    throw new Error('Each group must include a group name.');
  }

  if (!Number.isFinite(group.selected) || group.selected < 0) {
    throw new Error(`Group ${group.group} must include a valid selected count.`);
  }

  if (!Number.isFinite(group.total) || group.total <= 0) {
    throw new Error(`Group ${group.group} must include a valid total count.`);
  }

  if (group.selected > group.total) {
    throw new Error(`Group ${group.group} selected count cannot exceed total count.`);
  }
};

const getSelectionRate = ({ selected, total }) => selected / total;

const findReferenceGroup = (groupsWithRates) =>
  groupsWithRates.reduce((highest, current) =>
    current.selectionRate > highest.selectionRate ? current : highest
  );

const analyzeFourFifthsRule = (groups, options = {}) => {
  if (!Array.isArray(groups) || groups.length < 2) {
    throw new Error('At least two groups are required for 4/5ths Rule analysis.');
  }

  const threshold = options.threshold || FOUR_FIFTHS_THRESHOLD;

  if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 1) {
    throw new Error('Threshold must be a number between 0 and 1.');
  }

  groups.forEach(validateGroup);

  const groupsWithRates = groups.map((group) => ({
    ...group,
    selectionRate: getSelectionRate(group),
  }));

  const referenceGroup = findReferenceGroup(groupsWithRates);

  const results = groupsWithRates.map((group) => {
    const impactRatio = referenceGroup.selectionRate === 0
      ? 0
      : group.selectionRate / referenceGroup.selectionRate;

    return {
      group: group.group,
      selected: group.selected,
      total: group.total,
      selectionRate: roundToFour(group.selectionRate),
      impactRatio: roundToFour(impactRatio),
      flagged: impactRatio < threshold,
    };
  });

  return {
    threshold,
    referenceGroup: referenceGroup.group,
    referenceRate: roundToFour(referenceGroup.selectionRate),
    results,
  };
};

module.exports = {
  FOUR_FIFTHS_THRESHOLD,
  analyzeFourFifthsRule,
};
